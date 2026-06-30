from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.friendship import FriendshipStatus


class FriendRequestResponse(BaseModel):
    """
    response model for a friend request or friendship record.
    """
    id: UUID
    requester_id: UUID
    addressee_id: UUID
    status: FriendshipStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class FriendResponse(BaseModel):
    """
    response model representing a friend — includes the friend's
    user details for display in the friends list.
    """
    user_id: UUID
    username: str
    email: str
    friendship_id: UUID
    status: FriendshipStatus


class FriendRequestDetail(BaseModel):
    """
    response model for an incoming friend request — includes the
    requester's user details so the recipient knows who sent it.
    """
    friendship_id: UUID
    requester_id: UUID
    username: str
    email: str
    created_at: datetime