import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class DirectMessage(Base):
    """
    represents a direct message sent between two users.
    direct messages are private and only visible to the sender and recipient.
    soft delete is used so message history is preserved even if a user deletes their account.
    :param id: unique identifier for the message.
    :param sender_id: the user who sent the message.
    :param recipient_id: the user who received the message.
    :param content: the text content of the message.
    :param is_deleted: soft delete flag — message content is hidden but record is preserved.
    :param is_read: whether the recipient has read the message.
    :param created_at: timestamp when the message was sent.
    :param edited_at: timestamp when the message was last edited, if applicable.
    """
    __tablename__ = "direct_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(String(4000), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    edited_at = Column(DateTime(timezone=True), nullable=True)

    # relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_dms")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_dms")