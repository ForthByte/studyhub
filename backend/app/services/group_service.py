from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.group import Group, GroupMember, GroupRole
from app.models.user import User

def create_group(db: Session, owner_id: UUID, name: str, description: str | None, is_private: bool) -> Group:
    """
    Create a new study group and assign the creator as the group owner
    :param db: active database session
    :param owner_id: ID of the user creating the study group
    :param name: name of the study group
    :param description: optional description of the study group
    :param is_private: whether the group is invite only or not
    :return: the newly created group object
    """
    group = Group(
        name=name,
        description=description,
        owner_id=owner_id,
        is_private=is_private
    )

    db.add(group)
    db.flush()

    membership = GroupMember(
        group_id=group.id,
        user_id=owner_id,
        role=GroupRole.owner
    )

    db.add(membership)
    db.commit()
    db.refresh(group)

    return group



def join_group_by_invite_code(db: Session, user_id: UUID, invite_code: str)-> GroupMember | None:
    """
    add a user to a study group using an invitation code
    :param db: active database session
    :param user_id: ID of the user to join
    :param invite_code: invite code belonging to the group
    :return: the created GroupMember object, or None if the group does not exist
    """
    group = db.query(Group).filter(Group.invite_code == invite_code).first()

    if group is None:
        return None

    existing_membership = (
        db.query(GroupMember).filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == user_id
        )
        .first()
    )

    if existing_membership is not None:
        return existing_membership

    membership = GroupMember(
        group_id=group.id,
        user_id=user_id,
        role=GroupRole.member
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return membership


def get_user_groups(db: Session, user_id: UUID) -> list[Group]:
    """
    retrieves all study groups belonging to a user
    :param db: active database session
    :param user_id: ID of the user to query
    :return: list of group objects
    """

    results = (
        db.query(Group, GroupMember)
        .join(GroupMember, Group.id == GroupMember.group_id)
        .filter(GroupMember.user_id == user_id)
        .all()
    )

    groups = []

    for group, membership in results:
        groups.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "owner_id": group.owner_id,
            "invite_code": group.invite_code,
            "is_private": group.is_private,
            "created_at": group.created_at,
            "my_role": membership.role,
        })

    return groups




def get_group_by_id(db: Session, group_id: UUID) -> Group | None:
    """
    retrieves a study group by ID
    :param db: active database session
    :param group_id: unique id of the study group
    :return: Group object if found, otherwise None
    """
    return db.query(Group).filter(Group.id == group_id).first()


def leave_group(db: Session, group_id: UUID, user_id: UUID) -> bool:
    """
    remove a user from a study group
    :param db: active database session
    :param group_id: the unique id of the study group
    :param user_id: the unique id of the user to remove
    :return: True if the user was removed, False otherwise
    """

    membership = (
        db.query(GroupMember)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        )
        .first()
    )

    if membership is None:
        return False

    if membership.role == GroupRole.owner:
        return False

    db.delete(membership)
    db.commit()


    return True


def get_user_membership(db: Session, group_id: UUID, user_id: UUID) -> GroupMember | None:
    """
    retrieve a user's membership record for a specific group.
    :param db: active database session.
    :param group_id: ID of the group.
    :param user_id: ID of the user.
    :return: GroupMember object if found, otherwise None.
    """
    return (
        db.query(GroupMember)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        )
        .first()
    )


def require_group_admin(db: Session, group_id: UUID, user_id: UUID) -> GroupMember:
    """
    ensure that a user is an owner or admin of a group.
    :param db: active database session.
    :param group_id: ID of the group.
    :param user_id: ID of the user.
    :return: the user's membership record.
    :raises HTTPException: if the user is not an admin or owner.
    """
    membership = get_user_membership(db, group_id, user_id)

    if membership is None or membership.role not in [GroupRole.owner, GroupRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this group"
        )

    return membership


def require_group_owner(db: Session, group_id: UUID, user_id: UUID) -> GroupMember:
    """
    ensure that a user is the owner of a group.
    :param db: active database session.
    :param group_id: ID of the group.
    :param user_id: ID of the user.
    :return: the owner's membership record.
    :raises HTTPException: if the user is not the group owner.
    """
    membership = get_user_membership(db, group_id, user_id)

    if membership is None or membership.role != GroupRole.owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the group owner can perform this action"
        )

    return membership


def get_group_details(db: Session, group_id: UUID, user_id: UUID) -> dict | None:
    """
    retrieve group details including member count and the requesting user's role.

    :param db: active database session.
    :param group_id: ID of the group.
    :param user_id: ID of the requesting user.
    :return: dictionary containing group detail data, or None if group not found.
    """
    group = get_group_by_id(db, group_id)

    if group is None:
        return None

    membership = get_user_membership(db, group_id, user_id)

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )

    member_count = (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id)
        .count()
    )

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "owner_id": group.owner_id,
        "invite_code": group.invite_code,
        "is_private": group.is_private,
        "created_at": group.created_at,
        "member_count": member_count,
        "my_role": membership.role,
    }


def get_group_members(db: Session, group_id: UUID, user_id: UUID) -> list[dict]:
    """
    retrieve all members of a group.
    :param db: active database session.
    :param group_id: ID of the group.
    :param user_id: ID of the requesting user.
    :return: list of group member data.
    """
    membership = get_user_membership(db, group_id, user_id)

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )

    results = (
        db.query(GroupMember, User)
        .join(User, GroupMember.user_id == User.id)
        .filter(GroupMember.group_id == group_id)
        .all()
    )

    members = []

    for group_member, user in results:
        members.append({
            "group_id": group_member.group_id,
            "user_id": group_member.user_id,
            "username": user.username,
            "role": group_member.role,
            "joined_at": group_member.joined_at,
        })

    return members


def delete_group(db: Session, group_id: UUID, user_id: UUID) -> bool:
    """
    delete a study group.
    only the group owner can delete the group.
    :param db: active database session.
    :param group_id: ID of the group.
    :param user_id: ID of the requesting user.
    :return: True if deleted, False if group does not exist.
    """
    group = get_group_by_id(db, group_id)

    if group is None:
        return False

    require_group_owner(db, group_id, user_id)

    db.delete(group)
    db.commit()

    return True


def promote_group_member(db: Session, group_id: UUID, target_user_id: UUID, current_user_id: UUID) -> GroupMember | None:
    """
    promote a group member to admin.
    only the group owner can promote members.
    :param db: active database session.
    :param group_id: ID of the group.
    :param target_user_id: ID of the user being promoted.
    :param current_user_id: ID of the user performing the action.
    :return: updated GroupMember object, or None if target membership does not exist.
    """
    require_group_owner(db, group_id, current_user_id)

    membership = get_user_membership(db, group_id, target_user_id)

    if membership is None:
        return None

    if membership.role == GroupRole.owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group owner cannot be promoted"
        )

    membership.role = GroupRole.admin

    db.commit()
    db.refresh(membership)

    return membership


def demote_group_admin(db: Session, group_id: UUID, target_user_id: UUID, current_user_id: UUID) -> GroupMember | None:
    """
    demote a group admin back to member.
    only the group owner can demote admins.
    :param db: active database session.
    :param group_id: ID of the group.
    :param target_user_id: ID of the user being demoted.
    :param current_user_id: ID of the user performing the action.
    :return: updated GroupMember object, or None if target membership does not exist.
    """
    require_group_owner(db, group_id, current_user_id)

    membership = get_user_membership(db, group_id, target_user_id)

    if membership is None:
        return None

    if membership.role == GroupRole.owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group owner cannot be demoted"
        )

    membership.role = GroupRole.member

    db.commit()
    db.refresh(membership)

    return membership


