from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.security import decode_token

# Bearer token scheme — instructs FastAPI to extract the token from the
# Authorization: Bearer <token> header on incoming requests.
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that validates a JWT access token and returns the
    authenticated user. Inject into any route that requires a logged-in user.
    Raises a 401 if the token is missing, invalid, expired, or the user no
    longer exists in the database.
    :param credentials: the Bearer token extracted from the Authorization header.
    :param db: the database session provided by the get_db dependency.
    :return: the authenticated User model instance.
    """
    token = credentials.credentials

    # decode_token returns None if the token is invalid or expired
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # extract the user ID from the token subject claim
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # confirm the token type is access, not a refresh token being misused
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type — access token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # look up the user in the database to ensure they still exist
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user