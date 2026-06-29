import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ChannelType(str, PyEnum):
    """type of channel — text channels are the default, more types can be added later."""
    text = "text"


class Channel(Base):
    """
    represents a chat channel within a study group.
    each group has a #general channel created by default when the group is created.
    owners and admins can create additional channels.
    """
    __tablename__ = "channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    channel_type = Column(Enum(ChannelType), default=ChannelType.text, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # relationships
    group = relationship("Group", back_populates="channels")
    messages = relationship("Message", back_populates="channel", cascade="all, delete-orphan")