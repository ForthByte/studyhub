from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    """
    request model used when sending a new message in a channel.
    content is validated to prevent empty messages.
    """
    content: str = Field(min_length=1, max_length=4000)


class MessageResponse(BaseModel):
    """
    response model returned when message data is requested.
    includes author details for display in the chat UI.
    """
    id: UUID
    channel_id: UUID
    user_id: UUID | None
    content: str
    is_deleted: bool
    created_at: datetime
    edited_at: datetime | None

    # author details — flattened for convenience so the frontend
    # doesn't need to make a separate request to get the username
    username: str | None = None

    model_config = {
        "from_attributes": True
    }


class WebSocketMessage(BaseModel):
    """
    message format used over the WebSocket connection.
    the type field determines how the client handles the payload:
    - 'message' — a new chat message
    - 'typing' — a user is currently typing
    - 'stop_typing' — a user stopped typing
    - 'presence' — a user joined or left the channel
    """
    type: str
    payload: dict