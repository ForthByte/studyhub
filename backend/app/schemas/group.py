from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field
from app.models.group import GroupRole

class GroupCreate(BaseModel):
    """
    request model used when creating a new study group
    """

    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    is_private: bool = True

class GroupResponse(BaseModel):
    """
    response model returned when group information is requested
    """
    id: UUID
    name: str
    description: str | None
    owner_id: UUID
    invite_code: str
    is_private: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class GroupJoinRequest(BaseModel):
    """
    request model used when joining a study group
    """
    invite_code: str = Field(min_length=12, max_length=12)

class GroupMemberResponse(BaseModel):
    """
    response model representing a group membership
    """
    group_id: UUID
    user_id: UUID
    role: GroupRole
    joined_at: datetime

    model_config = {
        "from_attributes": True
    }

class GroupDetailResponse(BaseModel):
    """
    detailed group response including membership information
    """

    member_count: int
    my_role: GroupRole | None = None


class GroupMemberDetailResponse(BaseModel):
    """
    response model representing a group member with user display data
    """
    group_id: UUID
    user_id: UUID
    username: str
    role: GroupRole
    joined_at: datetime

class GroupWithRoleResponse(BaseModel):
    """
    response model for groups the current user belongs to
    """
    my_role: GroupRole