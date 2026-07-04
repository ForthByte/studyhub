from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/presence", tags=["presence"])


def get_redis():
    """
    get a Redis client instance.
    imported here to avoid circular imports and keep the connection lazy.
    """
    import redis
    import os
    return redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))


@router.post("/heartbeat", status_code=204)
def heartbeat(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    update the current user's last seen timestamp in Redis.
    called every 30 seconds by the frontend to indicate the user is active.
    the key expires after 60 seconds so a user is considered offline
    if no heartbeat is received within that window.
    :param current_user: authenticated user sending the heartbeat.
    :param db: SQLAlchemy database session dependency.
    :return: no response body.
    """
    r = get_redis()
    # set key with 60 second TTL — if no heartbeat in 60s, user is offline
    r.setex(f"presence:{current_user.id}", 60, "online")
    return None


@router.post("/status")
def get_status(
    user_ids: list[str],
    current_user: User = Depends(get_current_user),
):
    """
    check the online status of a list of users.
    returns a dict mapping user_id to True (online) or False (offline).
    a user is online if their presence key exists in Redis (i.e. heartbeat
    was received within the last 60 seconds).
    :param user_ids: list of user IDs to check status for.
    :param current_user: authenticated user making the request.
    :return: dict mapping user_id str to online bool.
    """
    r = get_redis()
    result = {}
    for uid in user_ids:
        result[uid] = r.exists(f"presence:{uid}") == 1
    return result