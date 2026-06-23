from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.group import (
    GroupCreate,
    GroupDetailResponse,
    GroupJoinRequest,
    GroupMemberDetailResponse,
    GroupMemberResponse,
    GroupResponse,
    GroupWithRoleResponse
)
from app.services.group_service import (
    create_group,
    delete_group,
    demote_group_admin,
    get_group_by_id,
    get_group_details,
    get_group_members,
    get_user_groups,
    join_group_by_invite_code,
    leave_group,
    promote_group_member,
)

router = APIRouter(prefix="/api/v1/groups", tags=["groups"])



@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_study_group(
    group_in: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    create a new study group for the authenticated user.
    The current user (one who creates the group) is automatically assigned as the owner of the group.
    :param group_in: study group creation data.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user creating the group.
    :return: the newly created study group.
    """
    return create_group(
        db=db,
        owner_id=current_user.id,
        name=group_in.name,
        description=group_in.description,
        is_private=group_in.is_private,
    )


@router.post("/join", response_model=GroupMemberResponse)
def join_study_group(
    join_in: GroupJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    join an existing study group using an invitation code.
    :param join_in: request body containing the group invite code.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user joining the group.
    :return: the user's group membership record.
    """
    membership = join_group_by_invite_code(
        db=db,
        user_id=current_user.id,
        invite_code=join_in.invite_code,
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study group not found",
        )

    return membership


@router.get("/me", response_model=list[GroupWithRoleResponse])
def list_my_study_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all study groups that the authenticated user belongs to.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting their groups.
    :return: list of study groups the user is a member of.
    """
    return get_user_groups(db=db, user_id=current_user.id)



@router.get("/{group_id}/details", response_model=GroupDetailResponse)
def get_study_group_details(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve detailed information for a specific study group.
    :param group_id: unique identifier of the study group.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: detailed study group information.
    """
    group_details = get_group_details(
        db=db,
        group_id=group_id,
        user_id=current_user.id,
    )

    if group_details is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study group not found",
        )

    return group_details

@router.get("/{group_id}/members", response_model=list[GroupMemberDetailResponse])
def list_group_members(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all members of a specific study group.
    :param group_id: unique identifier of the study group.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: list of group members.
    """
    return get_group_members(
        db=db,
        group_id=group_id,
        user_id=current_user.id,
    )

@router.post("/{group_id}/admins/{user_id}", response_model=GroupMemberResponse)
def promote_member_to_admin(
    group_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    promote a group member to admin.
    only the group owner can promote members.
    :param group_id: unique identifier of the study group.
    :param user_id: unique identifier of the user being promoted.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: updated group membership record.
    """
    membership = promote_group_member(
        db=db,
        group_id=group_id,
        target_user_id=user_id,
        current_user_id=current_user.id,
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group member not found",
        )

    return membership

@router.delete("/{group_id}/admins/{user_id}", response_model=GroupMemberResponse)
def demote_admin_to_member(
    group_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    demote a group admin back to member.
    only the group owner can demote admins.
    :param group_id: unique identifier of the study group.
    :param user_id: unique identifier of the user being demoted.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: updated group membership record.
    """
    membership = demote_group_admin(
        db=db,
        group_id=group_id,
        target_user_id=user_id,
        current_user_id=current_user.id,
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group member not found",
        )

    return membership


@router.delete("/{group_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_study_group(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    lave a study group.
    the group owners cannot leave their own group using this endpoint.

    :param group_id: unique identifier of the study group.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user leaving the group.
    :return: no response body if successful.
    """
    left_group = leave_group(
        db=db,
        group_id=group_id,
        user_id=current_user.id,
    )

    if not left_group:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to leave study group",
        )

    return None







@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_group(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    delete a study group.
    only the group owner can delete a study group.

    :param group_id: unique identifier of the study group.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: no response body if successful.
    """
    deleted = delete_group(
        db=db,
        group_id=group_id,
        user_id=current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study group not found",
        )

    return None




@router.get("/{group_id}", response_model=GroupResponse)
def get_study_group(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve a specific study group by ID.
    :param group_id: unique identifier of the study group.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user making the request.
    :return: matching study group.
    """
    group = get_group_by_id(db=db, group_id=group_id)

    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study group not found",
        )

    return group
