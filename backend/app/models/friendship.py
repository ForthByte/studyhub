import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class FriendshipStatus(str, PyEnum):
    """
    status of a friendship between two users.
    - pending: the request has been sent but not yet accepted or declined.
    - accepted: both users are friends.
    - declined: the request was declined by the recipient.
    """
    pending = "pending"
    accepted = "accepted"
    declined = "declined"


class Friendship(Base):
    """
    represents a friendship or friend request between two users.
    the requester_id is the user who sent the request.
    the addressee_id is the user who received the request.
    a unique constraint prevents duplicate friendship records between the same pair.
    """
    __tablename__ = "friendships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    addressee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(FriendshipStatus), nullable=False, default=FriendshipStatus.pending)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_requests")
    addressee = relationship("User", foreign_keys=[addressee_id], back_populates="received_requests")

    # prevent duplicate friendship records between the same pair of users
    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id", name="uq_friendship_pair"),
    )