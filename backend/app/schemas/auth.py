from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    """
    data transfer object for user registration requests.
    validates the inbound payload required to create a new user account.

    :param email: A strictly validated email address format string.
    :param username: The chosen public display name for the user.
    :param password: The plain-text password to be hashed and stored.
    """
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    """
    data transfer object for user authentication requests.
    validates the inbound payload required for logging in.

    :param email: A strictly validated email address format string.
    :param password: The plain-text password to verify against the stored hash.
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    data transfer object for outbound user profiles.
    filters out sensitive data before sending the data to the client.

    :param id: unique UUID identifying the user.
    :param email: validated email address of the user.
    :param username: public display name of the user.
    :param created_at: timestamp indicating when the profile was created.
    """
    id: UUID
    email: EmailStr
    username: str
    created_at: datetime

    class Config:
        # Enables Pydantic to read ORM models (SQLAlchemy objects) directly instead of requiring a standard Python dictionary.
        from_attributes = True


class TokenResponse(BaseModel):
    """
    data transfer object for successful authentication responses.
    returns the bearer token structure to the client application.

    :param access_token: short-lived JWT access token string.
    :param token_type: type of authentication token, defaulting to "bearer".
    """
    access_token: str
    token_type: str = "bearer"