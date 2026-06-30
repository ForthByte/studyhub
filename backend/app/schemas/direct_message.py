from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DirectMessageCreate(BaseModel):
    """
    request model used when sending a direct message to another user.
    content is validated to prevent empty messages.
    """
    content: str = Field(min_length=1, max_length=4000)


class DirectMessageResponse(BaseModel):
    """
    response model returned when direct message data is requested.
    includes sender details for display in the DM conversation UI.
    """
    id: UUID
    sender_id: UUID | None
    recipient_id: UUID | None
    content: str
    is_deleted: bool
    is_read: bool
    created_at: datetime
    edited_at: datetime | None

    # sender username flattened onto the response so the frontend
    # doesn't need a separate request to get the display name
    sender_username: str | None = None

    model_config = {
        "from_attributes": True
    }


class DMWebSocketMessage(BaseModel):
    """
    message format used over the DM WebSocket connection.
    the type field determines how the client handles the payload:
    - 'message' — a new direct message
    - 'typing' — the other user is typing
    - 'stop_typing' — the other user stopped typing
    - 'read' — the recipient has read the messages
    """
    type: str
    payload: dict