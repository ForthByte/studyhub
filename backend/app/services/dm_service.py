from uuid import UUID

from sqlalchemy.orm import Session

from app.models.direct_message import DirectMessage
from app.models.friendship import Friendship, FriendshipStatus
from app.schemas.direct_message import DirectMessageResponse


def are_friends(db: Session, user_a: UUID, user_b: UUID) -> bool:
    """
    check whether two users are friends.
    used to authorise sending direct messages — only friends can DM each other.
    :param db: SQLAlchemy database session.
    :param user_a: first user ID.
    :param user_b: second user ID.
    :return: True if the two users have an accepted friendship.
    """
    return db.query(Friendship).filter(
        (
            (Friendship.requester_id == user_a) & (Friendship.addressee_id == user_b)
        ) | (
            (Friendship.requester_id == user_b) & (Friendship.addressee_id == user_a)
        ),
        Friendship.status == FriendshipStatus.accepted,
    ).first() is not None


def get_dm_history(
    db: Session,
    user_id: UUID,
    other_user_id: UUID,
    limit: int = 50,
) -> list[DirectMessageResponse]:
    """
    retrieve the most recent direct messages between two users, oldest first.
    flattens the sender username onto each response for frontend convenience.
    :param db: SQLAlchemy database session.
    :param user_id: the current user's ID.
    :param other_user_id: the other user's ID.
    :param limit: maximum number of messages to return.
    :return: list of direct message responses ordered oldest to newest.
    """
    messages = (
        db.query(DirectMessage)
        .filter(
            DirectMessage.is_deleted == False,
            (
                (DirectMessage.sender_id == user_id) & (DirectMessage.recipient_id == other_user_id)
            ) | (
                (DirectMessage.sender_id == other_user_id) & (DirectMessage.recipient_id == user_id)
            ),
        )
        .order_by(DirectMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    # reverse so oldest messages appear first in the chat UI
    messages = list(reversed(messages))

    return [
        DirectMessageResponse(
            id=msg.id,
            sender_id=msg.sender_id,
            recipient_id=msg.recipient_id,
            content=msg.content,
            is_deleted=msg.is_deleted,
            is_read=msg.is_read,
            created_at=msg.created_at,
            edited_at=msg.edited_at,
            sender_username=msg.sender.username if msg.sender else "Deleted user",
        )
        for msg in messages
    ]


def mark_messages_as_read(db: Session, user_id: UUID, other_user_id: UUID) -> None:
    """
    mark all unread messages from other_user_id to user_id as read.
    called when a user opens a DM conversation.
    :param db: SQLAlchemy database session.
    :param user_id: the current user (recipient) marking messages as read.
    :param other_user_id: the sender whose messages are being marked as read.
    """
    db.query(DirectMessage).filter(
        DirectMessage.sender_id == other_user_id,
        DirectMessage.recipient_id == user_id,
        DirectMessage.is_read == False,
    ).update({"is_read": True})
    db.commit()


def get_unread_count(db: Session, user_id: UUID) -> dict[str, int]:
    """
    get the count of unread messages per sender for the current user.
    used to show unread badges on the friends list.
    :param db: SQLAlchemy database session.
    :param user_id: the current user's ID.
    :return: dict mapping sender_id (str) to unread message count.
    """
    messages = (
        db.query(DirectMessage)
        .filter(
            DirectMessage.recipient_id == user_id,
            DirectMessage.is_read == False,
            DirectMessage.is_deleted == False,
        )
        .all()
    )

    counts: dict[str, int] = {}
    for msg in messages:
        key = str(msg.sender_id)
        counts[key] = counts.get(key, 0) + 1

    return counts