from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.friendship import Friendship, FriendshipStatus
from app.models.user import User


def get_user_by_username(db: Session, username: str) -> User | None:
    """
    retrieve a user by their username.
    used when sending a friend request by username.
    :param db: SQLAlchemy database session.
    :param username: the username to search for.
    :return: the matching User or None if not found.
    """
    return db.query(User).filter(User.username == username).first()


def get_existing_friendship(db: Session, user_a: UUID, user_b: UUID) -> Friendship | None:
    """
    check if a friendship or pending request already exists between two users.
    checks both directions since either user could have sent the request.
    :param db: SQLAlchemy database session.
    :param user_a: first user ID.
    :param user_b: second user ID.
    :return: existing Friendship record or None.
    """
    return db.query(Friendship).filter(
        (
            (Friendship.requester_id == user_a) & (Friendship.addressee_id == user_b)
        ) | (
            (Friendship.requester_id == user_b) & (Friendship.addressee_id == user_a)
        )
    ).first()


def send_friend_request(db: Session, requester_id: UUID, addressee_username: str) -> Friendship:
    """
    send a friend request to a user by their username.
    raises an error if the user doesn't exist, if you're trying to add yourself,
    or if a friendship or request already exists between the two users.
    :param db: SQLAlchemy database session.
    :param requester_id: ID of the user sending the request.
    :param addressee_username: username of the user to send the request to.
    :return: the newly created Friendship record.
    """
    addressee = get_user_by_username(db, addressee_username)

    if addressee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{addressee_username}' not found",
        )

    if addressee.id == requester_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a friend request to yourself",
        )

    existing = get_existing_friendship(db, requester_id, addressee.id)

    if existing:
        if existing.status == FriendshipStatus.accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already friends with this user",
            )
        if existing.status == FriendshipStatus.pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A friend request is already pending with this user",
            )
        if existing.status == FriendshipStatus.declined:
            # allow re-sending if the previous request was declined
            existing.status = FriendshipStatus.pending
            existing.requester_id = requester_id
            existing.addressee_id = addressee.id
            db.commit()
            db.refresh(existing)
            return existing

    friendship = Friendship(
        requester_id=requester_id,
        addressee_id=addressee.id,
        status=FriendshipStatus.pending,
    )
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return friendship


def accept_friend_request(db: Session, addressee_id: UUID, friendship_id: UUID) -> Friendship:
    """
    accept an incoming friend request.
    only the addressee (recipient) can accept the request.
    :param db: SQLAlchemy database session.
    :param addressee_id: ID of the user accepting the request.
    :param friendship_id: ID of the friendship record to accept.
    :return: the updated Friendship record.
    """
    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()

    if friendship is None or friendship.addressee_id != addressee_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found",
        )

    if friendship.status != FriendshipStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This request has already been responded to",
        )

    friendship.status = FriendshipStatus.accepted
    db.commit()
    db.refresh(friendship)
    return friendship


def decline_friend_request(db: Session, addressee_id: UUID, friendship_id: UUID) -> Friendship:
    """
    decline an incoming friend request.
    only the addressee (recipient) can decline the request.
    :param db: SQLAlchemy database session.
    :param addressee_id: ID of the user declining the request.
    :param friendship_id: ID of the friendship record to decline.
    :return: the updated Friendship record.
    """
    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()

    if friendship is None or friendship.addressee_id != addressee_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found",
        )

    if friendship.status != FriendshipStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This request has already been responded to",
        )

    friendship.status = FriendshipStatus.declined
    db.commit()
    db.refresh(friendship)
    return friendship


def remove_friend(db: Session, user_id: UUID, friend_id: UUID) -> bool:
    """
    remove an accepted friendship between two users.
    either user can remove the other.
    :param db: SQLAlchemy database session.
    :param user_id: ID of the user removing the friend.
    :param friend_id: ID of the friend to remove.
    :return: True if removed successfully.
    """
    friendship = get_existing_friendship(db, user_id, friend_id)

    if friendship is None or friendship.status != FriendshipStatus.accepted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship not found",
        )

    db.delete(friendship)
    db.commit()
    return True


def get_friends(db: Session, user_id: UUID) -> list[dict]:
    """
    retrieve all accepted friends for a user.
    returns the friend's user details alongside the friendship record.
    :param db: SQLAlchemy database session.
    :param user_id: ID of the user to fetch friends for.
    :return: list of friend data dicts.
    """
    friendships = db.query(Friendship).filter(
        (
            (Friendship.requester_id == user_id) |
            (Friendship.addressee_id == user_id)
        ),
        Friendship.status == FriendshipStatus.accepted,
    ).all()

    friends = []
    for f in friendships:
        # determine which user is the friend (not the current user)
        is_requester = f.requester_id == user_id
        friend_user = f.addressee if is_requester else f.requester

        friends.append({
            "user_id": friend_user.id,
            "username": friend_user.username,
            "email": friend_user.email,
            "friendship_id": f.id,
            "status": f.status,
        })

    return friends


def get_incoming_requests(db: Session, user_id: UUID) -> list[dict]:
    """
    retrieve all pending incoming friend requests for a user.
    :param db: SQLAlchemy database session.
    :param user_id: ID of the user to fetch incoming requests for.
    :return: list of incoming request data dicts.
    """
    requests = db.query(Friendship).filter(
        Friendship.addressee_id == user_id,
        Friendship.status == FriendshipStatus.pending,
    ).all()

    return [
        {
            "friendship_id": r.id,
            "requester_id": r.requester_id,
            "username": r.requester.username,
            "email": r.requester.email,
            "created_at": r.created_at,
        }
        for r in requests
    ]