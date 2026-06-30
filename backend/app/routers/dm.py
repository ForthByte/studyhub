from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.dependencies import get_current_user
from app.models.direct_message import DirectMessage
from app.models.user import User
from app.schemas.direct_message import DirectMessageResponse
from app.security import decode_token
from app.services.dm_service import are_friends, get_dm_history, get_unread_count, mark_messages_as_read
from app.services.chat_manager import ConnectionManager

router = APIRouter(prefix="/api/v1/dm", tags=["dm"])

# separate connection manager for DMs — keeps DM connections isolated from channel connections.
# rooms are keyed by a sorted pair of user IDs to ensure both users share the same room.
dm_manager = ConnectionManager()


def get_dm_room_id(user_a: UUID, user_b: UUID) -> str:
    """
    generate a consistent room ID for a DM conversation between two users.
    sorts the IDs so the room is the same regardless of who initiated the connection.
    :param user_a: first user ID.
    :param user_b: second user ID.
    :return: a string room ID in the format 'dm_{smaller_id}_{larger_id}'.
    """
    ids = sorted([str(user_a), str(user_b)])
    return f"dm_{ids[0]}_{ids[1]}"


@router.get("/unread", response_model=dict)
def get_unread(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve unread message counts per sender for the current user.
    used to show unread badges on the friends list in the sidebar.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting their unread counts.
    :return: dict mapping sender_id to unread message count.
    """
    return get_unread_count(db, current_user.id)


@router.get("/{user_id}/messages", response_model=list[DirectMessageResponse])
def get_messages(
    user_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve DM history between the current user and another user.
    also marks all unread messages from the other user as read.
    only friends can view each other's DM history.
    :param user_id: ID of the other user in the conversation.
    :param limit: maximum number of messages to return.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting the messages.
    :return: list of direct messages ordered oldest to newest.
    """
    if not are_friends(db, current_user.id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only message friends",
        )

    mark_messages_as_read(db, current_user.id, user_id)
    return get_dm_history(db, current_user.id, user_id, limit)


@router.websocket("/{user_id}/ws")
async def dm_websocket(
    websocket: WebSocket,
    user_id: str,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time direct messaging.
    clients connect by passing their JWT access token as a query parameter.
    on connection: validates token, checks friendship, sends message history.
    on message: saves to database, broadcasts to both users in the DM room.
    on disconnect: removes from connection pool.

    message format sent by client:
        {"type": "message", "content": "hello!"}
        {"type": "typing"}
        {"type": "stop_typing"}
        {"type": "read"}

    message format broadcast to clients:
        {"type": "message", "payload": {...DirectMessageResponse}}
        {"type": "typing", "payload": {"user_id": "...", "username": "..."}}
        {"type": "stop_typing", "payload": {"user_id": "...", "username": "..."}}
        {"type": "read", "payload": {"reader_id": "..."}}
        {"type": "history", "payload": {"messages": [...]}}
        {"type": "error", "payload": {"detail": "..."}}
    """
    db: Session = SessionLocal()

    try:
        # ── authenticate ────────────────────────────────────────────────────
        payload = decode_token(token)

        if payload is None or payload.get("type") != "access":
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "Invalid token"}}')
            await websocket.close(code=1008)
            return

        current_user_id = payload.get("sub")
        current_user: User | None = db.query(User).filter(User.id == current_user_id).first()

        if current_user is None:
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "User not found"}}')
            await websocket.close(code=1008)
            return

        # ── validate friendship ─────────────────────────────────────────────
        other_user: User | None = db.query(User).filter(User.id == user_id).first()

        if other_user is None:
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "User not found"}}')
            await websocket.close(code=1008)
            return

        if not are_friends(db, current_user.id, other_user.id):
            await websocket.accept()
            await websocket.send_text('{"type": "error", "payload": {"detail": "You can only message friends"}}')
            await websocket.close(code=1008)
            return

        # ── connect and send history ────────────────────────────────────────
        room_id = get_dm_room_id(current_user.id, other_user.id)
        await dm_manager.connect(websocket, room_id)

        # mark messages as read on connect
        mark_messages_as_read(db, current_user.id, other_user.id)

        # send message history
        history = get_dm_history(db, current_user.id, other_user.id)
        history_payload = [
            {
                "id": str(msg.id),
                "sender_id": str(msg.sender_id) if msg.sender_id else None,
                "recipient_id": str(msg.recipient_id) if msg.recipient_id else None,
                "content": msg.content,
                "is_deleted": msg.is_deleted,
                "is_read": msg.is_read,
                "created_at": msg.created_at.isoformat(),
                "edited_at": msg.edited_at.isoformat() if msg.edited_at else None,
                "sender_username": msg.sender_username,
            }
            for msg in history
        ]
        await dm_manager.send_personal(
            {"type": "history", "payload": {"messages": history_payload}},
            websocket,
        )

        # ── message loop ────────────────────────────────────────────────────
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "message":
                content = data.get("content", "").strip()

                if not content or len(content) > 4000:
                    await dm_manager.send_personal(
                        {"type": "error", "payload": {"detail": "Invalid message content"}},
                        websocket,
                    )
                    continue

                # persist the message
                message = DirectMessage(
                    sender_id=current_user.id,
                    recipient_id=other_user.id,
                    content=content,
                )
                db.add(message)
                db.commit()
                db.refresh(message)

                # broadcast to both users in the DM room
                await dm_manager.broadcast(
                    {
                        "type": "message",
                        "payload": {
                            "id": str(message.id),
                            "sender_id": str(message.sender_id),
                            "recipient_id": str(message.recipient_id),
                            "content": message.content,
                            "is_deleted": message.is_deleted,
                            "is_read": message.is_read,
                            "created_at": message.created_at.isoformat(),
                            "edited_at": None,
                            "sender_username": current_user.username,
                        },
                    },
                    room_id,
                )

            elif msg_type == "typing":
                await dm_manager.broadcast(
                    {
                        "type": "typing",
                        "payload": {
                            "user_id": str(current_user.id),
                            "username": current_user.username,
                        },
                    },
                    room_id,
                )

            elif msg_type == "stop_typing":
                await dm_manager.broadcast(
                    {
                        "type": "stop_typing",
                        "payload": {
                            "user_id": str(current_user.id),
                            "username": current_user.username,
                        },
                    },
                    room_id,
                )

            elif msg_type == "read":
                mark_messages_as_read(db, current_user.id, other_user.id)
                await dm_manager.broadcast(
                    {
                        "type": "read",
                        "payload": {"reader_id": str(current_user.id)},
                    },
                    room_id,
                )

    except WebSocketDisconnect:
        dm_manager.disconnect(websocket, room_id)

    except Exception:
        dm_manager.disconnect(websocket, room_id if 'room_id' in locals() else "")

    finally:
        db.close()