from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    register a new user in the system
    validates unique credentials, hashes the password and saves the user record
    :param user_in: user registration data containing email, username and password
    :param db: the SQLAlchemy database session dependency
    :return: the newly created user database object
    """
    existing = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    authenticate a user and initiate a secure session.
    verifies the user credentials, issues an access token in the response body and sets a long-lived refresh token in an HTTP-only cookie
    :param credentials: the user login credentials containing email and password
    :param response: FastAPI response object used to set secure cookies
    :param db: SQLAlchemy database session dependency
    :return: TokenResponse instance containing the short lived access token
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days to match REFRESH_TOKEN_EXPIRE_DAYS
    )

    return TokenResponse(access_token=access_token)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    retrieve the profile of the currently authenticated user.
    protected endpoint — requires a valid JWT access token.
    :param current_user: the authenticated user extracted from the JWT token.
    :return: the current user's profile data.
    """
    return current_user  # return the User object directly, UserResponse handles serialisation