from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.friendship import FriendRequestResponse, FriendResponse, FriendRequestDetail
from app.services.friendship_service import (
    send_friend_request,
    accept_friend_request,
    decline_friend_request,
    remove_friend,
    get_friends,
    get_incoming_requests,
)

router = APIRouter(prefix="/api/v1/friends", tags=["friends"])


@router.post("/request/{username}", response_model=FriendRequestResponse, status_code=status.HTTP_201_CREATED)
def send_request(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    send a friend request to a user by their username.
    raises 404 if the user doesn't exist, 400 if a request already exists.
    :param username: username of the user to send the request to.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user sending the request.
    :return: the newly created friendship record.
    """
    return send_friend_request(db, current_user.id, username)


@router.post("/accept/{friendship_id}", response_model=FriendRequestResponse)
def accept_request(
    friendship_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    accept an incoming friend request.
    only the recipient of the request can accept it.
    :param friendship_id: ID of the friendship record to accept.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user accepting the request.
    :return: the updated friendship record.
    """
    return accept_friend_request(db, current_user.id, friendship_id)


@router.post("/decline/{friendship_id}", response_model=FriendRequestResponse)
def decline_request(
    friendship_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    decline an incoming friend request.
    only the recipient of the request can decline it.
    :param friendship_id: ID of the friendship record to decline.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user declining the request.
    :return: the updated friendship record.
    """
    return decline_friend_request(db, current_user.id, friendship_id)


@router.delete("/{friend_id}", status_code=status.HTTP_204_NO_CONTENT)
def unfriend(
    friend_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    remove an accepted friendship.
    either user can remove the other.
    :param friend_id: ID of the friend to remove.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user removing the friend.
    :return: no response body if successful.
    """
    remove_friend(db, current_user.id, friend_id)
    return None


@router.get("", response_model=list[FriendResponse])
def list_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all accepted friends for the current user.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting their friends list.
    :return: list of friends with their user details.
    """
    return get_friends(db, current_user.id)


@router.get("/requests", response_model=list[FriendRequestDetail])
def list_incoming_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all pending incoming friend requests for the current user.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting their pending requests.
    :return: list of incoming friend requests with requester details.
    """
    return get_incoming_requests(db, current_user.id)