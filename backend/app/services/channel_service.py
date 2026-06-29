from uuid import UUID

from sqlalchemy.orm import Session

from app.models.channel import Channel, ChannelType
from app.models.group import GroupMember, GroupRole


def create_channel(
    db: Session,
    group_id: UUID,
    name: str,
    description: str | None,
    channel_type: ChannelType = ChannelType.text,
    is_default: bool = False,
) -> Channel:
    """
    create a new channel within a study group.
    called when a group is created (to make #general) or when an admin adds a channel.
    :param db: SQLAlchemy database session.
    :param group_id: the group this channel belongs to.
    :param name: display name of the channel.
    :param description: optional description of the channel's purpose.
    :param channel_type: type of channel — defaults to text.
    :param is_default: whether this is the default channel for the group.
    :return: the newly created channel.
    """
    channel = Channel(
        group_id=group_id,
        name=name,
        description=description,
        channel_type=channel_type,
        is_default=is_default,
    )
    db.add(channel)
    db.commit()
    db.refresh(channel)
    return channel


def get_group_channels(db: Session, group_id: UUID) -> list[Channel]:
    """
    retrieve all channels belonging to a study group.
    ordered so the default channel always appears first.
    :param db: SQLAlchemy database session.
    :param group_id: the group to fetch channels for.
    :return: list of channels ordered by is_default desc, then created_at asc.
    """
    return (
        db.query(Channel)
        .filter(Channel.group_id == group_id)
        .order_by(Channel.is_default.desc(), Channel.created_at.asc())
        .all()
    )


def get_channel_by_id(db: Session, channel_id: UUID) -> Channel | None:
    """
    retrieve a single channel by its ID.
    :param db: SQLAlchemy database session.
    :param channel_id: the channel's unique identifier.
    :return: the matching channel or None if not found.
    """
    return db.query(Channel).filter(Channel.id == channel_id).first()


def delete_channel(
    db: Session,
    channel_id: UUID,
    user_id: UUID,
    group_id: UUID,
) -> bool:
    """
    delete a channel from a group.
    only admins and owners can delete channels.
    the default channel cannot be deleted.
    :param db: SQLAlchemy database session.
    :param channel_id: the channel to delete.
    :param user_id: the user attempting the deletion.
    :param group_id: the group the channel belongs to.
    :return: True if deleted, False if not authorised or not found.
    """
    channel = db.query(Channel).filter(
        Channel.id == channel_id,
        Channel.group_id == group_id,
    ).first()

    if channel is None or channel.is_default:
        return False

    # only owners and admins can delete channels
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id,
    ).first()

    if membership is None or membership.role == GroupRole.member:
        return False

    db.delete(channel)
    db.commit()
    return True


def is_group_member(db: Session, group_id: UUID, user_id: UUID) -> bool:
    """
    check whether a user is a member of a given group.
    used to authorise WebSocket connections to group channels.
    :param db: SQLAlchemy database session.
    :param group_id: the group to check membership for.
    :param user_id: the user to check.
    :return: True if the user is a member of the group.
    """
    return db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id,
    ).first() is not None