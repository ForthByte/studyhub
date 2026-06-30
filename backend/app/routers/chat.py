from uuid import UUID

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.dependencies import get_current_user
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageResponse
from app.security import decode_token
from app.services.channel_service import get_channel_by_id, is_group_member
from app.services.chat_manager import manager

router = APIRouter(tags=["chat"])


def get_message_history(db: Session, channel_id: UUID, limit: int = 50) -> list[MessageResponse]:
    """
    retrieve the most recent messages for a channel, ordered oldest first.
    flattens author username onto each message response for frontend convenience.
    :param db: SQLAlchemy database session.
    :param channel_id: the channel to fetch messages for.
    :param limit: maximum number of messages to return (default 50).
    :return: list of message responses ordered oldest to newest.
    """
    messages = (
        db.query(Message)
        .filter(Message.channel_id == channel_id, Message.is_deleted == False)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )

    # reverse so oldest messages appear first in the chat UI
    messages = list(reversed(messages))

    result = []
    for msg in messages:
        result.append(MessageResponse(
            id=msg.id,
            channel_id=msg.channel_id,
            user_id=msg.user_id,
            content=msg.content,
            is_deleted=msg.is_deleted,
            created_at=msg.created_at,
            edited_at=msg.edited_at,
            username=msg.author.username if msg.author else "Deleted user",
        ))

    return result


@router.get("/api/v1/channels/{channel_id}/messages", response_model=list[MessageResponse])
def get_channel_messages(
    channel_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve message history for a channel via REST.
    called when a user first opens a channel to load existing messages.
    :param channel_id: the channel to fetch messages for.
    :param limit: maximum number of messages to return.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: list of messages ordered oldest to newest.
    """
    channel = get_channel_by_id(db, channel_id)

    if channel is None:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")

    if not is_group_member(db, channel.group_id, current_user.id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a member of this group")

    return get_message_history(db, channel_id, limit)


@router.websocket("/ws/channel/{channel_id}")
async def websocket_channel(
    websocket: WebSocket,
    channel_id: str,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time group chat.
    clients connect by passing their JWT access token as a query parameter.
    on connection: validates the token, checks group membership, sends message history.
    on message: saves to database, broadcasts to all channel connections.
    on disconnect: removes from connection pool and broadcasts presence update.

    message format sent by client:
        {"type": "message", "content": "hello!"}
        {"type": "typing"}
        {"type": "stop_typing"}

    message format broadcast to clients:
        {"type": "message", "payload": {...MessageResponse}}
        {"type": "typing", "payload": {"user_id": "...", "username": "..."}}
        {"type": "stop_typing", "payload": {"user_id": "...", "username": "..."}}
        {"type": "presence", "payload": {"user_id": "...", "username": "...", "event": "joined"|"left"}}
        {"type": "history", "payload": {"messages": [...]}}
        {"type": "error", "payload": {"detail": "..."}}
    """
    db: Session = SessionLocal()

    try:
        # ── authenticate via token query param ──────────────────────────────
        # WebSockets can't send custom headers so the JWT is passed as a query param
        payload = decode_token(token)

        if payload is None or payload.get("type") != "access":
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "Invalid token"}}')
            await websocket.close(code=1008)
            return

        user_id = payload.get("sub")
        user: User | None = db.query(User).filter(User.id == user_id).first()

        if user is None:
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "User not found"}}')
            await websocket.close(code=1008)
            return

        # ── validate channel and group membership ───────────────────────────
        channel = get_channel_by_id(db, UUID(channel_id))

        if channel is None:
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "Channel not found"}}')
            await websocket.close(code=1008)
            return

        if not is_group_member(db, channel.group_id, user.id):
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "Not a member of this group"}}')
            await websocket.close(code=1008)
            return

        # ── connect and send history ────────────────────────────────────────
        await manager.connect(websocket, channel_id)

        # send message history so the user sees existing messages on join
        history = get_message_history(db, UUID(channel_id))
        history_payload = [
            {
                "id": str(msg.id),
                "channel_id": str(msg.channel_id),
                "user_id": str(msg.user_id) if msg.user_id else None,
                "content": msg.content,
                "is_deleted": msg.is_deleted,
                "created_at": msg.created_at.isoformat(),
                "edited_at": msg.edited_at.isoformat() if msg.edited_at else None,
                "username": msg.username,
            }
            for msg in history
        ]
        await manager.send_personal(
            {"type": "history", "payload": {"messages": history_payload}},
            websocket,
        )

        # broadcast presence — notify others that this user joined
        await manager.broadcast(
            {
                "type": "presence",
                "payload": {
                    "user_id": str(user.id),
                    "username": user.username,
                    "event": "joined",
                    "online_count": manager.get_connection_count(channel_id),
                },
            },
            channel_id,
        )

        # ── message loop ────────────────────────────────────────────────────
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "message":
                content = data.get("content", "").strip()

                if not content or len(content) > 4000:
                    await manager.send_personal(
                        {"type": "error", "payload": {"detail": "Invalid message content"}},
                        websocket,
                    )
                    continue

                # persist the message to the database
                message = Message(
                    channel_id=UUID(channel_id),
                    user_id=user.id,
                    content=content,
                )
                db.add(message)
                db.commit()
                db.refresh(message)

                # broadcast the message to all channel connections
                await manager.broadcast(
                    {
                        "type": "message",
                        "payload": {
                            "id": str(message.id),
                            "channel_id": str(message.channel_id),
                            "user_id": str(message.user_id),
                            "content": message.content,
                            "is_deleted": message.is_deleted,
                            "created_at": message.created_at.isoformat(),
                            "edited_at": None,
                            "username": user.username,
                        },
                    },
                    channel_id,
                )

            elif msg_type == "typing":
                # broadcast typing indicator to everyone except the sender
                await manager.broadcast(
                    {
                        "type": "typing",
                        "payload": {
                            "user_id": str(user.id),
                            "username": user.username,
                        },
                    },
                    channel_id,
                )

            elif msg_type == "stop_typing":
                await manager.broadcast(
                    {
                        "type": "stop_typing",
                        "payload": {
                            "user_id": str(user.id),
                            "username": user.username,
                        },
                    },
                    channel_id,
                )

    except WebSocketDisconnect:
        # user disconnected — clean up and notify others
        manager.disconnect(websocket, channel_id)

        if 'user' in locals():
            await manager.broadcast(
                {
                    "type": "presence",
                    "payload": {
                        "user_id": str(user.id),
                        "username": user.username,
                        "event": "left",
                        "online_count": manager.get_connection_count(channel_id),
                    },
                },
                channel_id,
            )

    except Exception as e:
        manager.disconnect(websocket, channel_id)

    finally:
        db.close()