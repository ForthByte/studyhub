from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.group import GroupMember, GroupRole
from app.schemas.channel import ChannelCreate, ChannelResponse
from app.services.channel_service import (
    create_channel,
    get_group_channels,
    get_channel_by_id,
    delete_channel,
    is_group_member,
)

router = APIRouter(prefix="/api/v1/groups", tags=["channels"])


@router.get("/{group_id}/channels", response_model=list[ChannelResponse])
def list_channels(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all channels for a study group.
    only members of the group can view its channels.
    the default channel is always returned first.
    :param group_id: the group to fetch channels for.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: list of channels ordered by default first, then creation date.
    """
    if not is_group_member(db, group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )

    return get_group_channels(db, group_id)


@router.post("/{group_id}/channels", response_model=ChannelResponse, status_code=status.HTTP_201_CREATED)
def create_group_channel(
    group_id: UUID,
    channel_in: ChannelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    create a new channel within a study group.
    only group owners and admins can create channels.
    :param group_id: the group to create the channel in.
    :param channel_in: channel creation data.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: the newly created channel.
    """
    # verify the user is a member of this group
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
    ).first()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )

    # only owners and admins can create channels
    if membership.role == GroupRole.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group owners and admins can create channels",
        )

    return create_channel(
        db=db,
        group_id=group_id,
        name=channel_in.name,
        description=channel_in.description,
        channel_type=channel_in.channel_type,
    )


@router.delete("/{group_id}/channels/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group_channel(
    group_id: UUID,
    channel_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    delete a channel from a study group.
    only owners and admins can delete channels.
    the default channel cannot be deleted.
    :param group_id: the group the channel belongs to.
    :param channel_id: the channel to delete.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: no response body if successful.
    """
    deleted = delete_channel(
        db=db,
        channel_id=channel_id,
        user_id=current_user.id,
        group_id=group_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete this channel — you may not have permission or it may be the default channel",
        )

    return None