from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.channel import ChannelType


class ChannelCreate(BaseModel):
    """
    request model used when creating a new channel within a study group.
    """
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    channel_type: ChannelType = ChannelType.text


class ChannelResponse(BaseModel):
    """
    response model returned when channel information is requested.
    """
    id: UUID
    group_id: UUID
    name: str
    description: str | None
    channel_type: ChannelType
    is_default: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }