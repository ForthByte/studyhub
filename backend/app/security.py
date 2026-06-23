import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
from dotenv import load_dotenv


load_dotenv()

#JWT settings and environment variables
#fetch secret keys from environment variables to keep sensitive data safe.
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET")
ALGORITHM = "HS256"
#token expiration times. Fallback implemented to sensible defaults if env vars arent set.
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))


def hash_password(password: str) -> str:
    """
    Hash plain-text password using the configured bcrypt scheme.
    Used when registering a new user or updating an existing ones password.
    :param password: plain-text password to hash
    :return: securely hash password
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare a plain-text password against a hashed password.
    Used during user login to verify their credentials.
    :param plain_password:  plain-text password provided by the user to verify
    :param hashed_password: the hashed password retrieved from the database.
    :return: True if password matches, False otherwise
    """
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str) -> str:
    """
    Generate a short-lived JWT access token for user authentication.
    Used to grant access to protected API endpoints.
    :param user_id: the unique identifier of the authenticated user.
    :return: an encoded JWT access token String.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """
    Generate a short-lived JWT refresh token for user authentication.
    Used to request new access tokens without requiring the user to re-login
    :param user_id: the unique identifier of the authenticated user.
    :return: an encoded JWT refresh token String.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, JWT_REFRESH_SECRET, algorithm=ALGORITHM)


def decode_token(token: str, refresh: bool = False) -> dict | None:
    """
    Decode and validate an access or refresh JWT token.
    Used to authenticate requests and extract user session data.
    :param token: the encoded JWT token string to decode.
    :param refresh: Flag to indicate whether to use the refresh token secret key.
    :return: the decoded payload dictionary if valid, or None if token is invalid.
    """
    #select appropriate secret key based on token type
    secret = JWT_REFRESH_SECRET if refresh else JWT_SECRET
    try:
        return jwt.decode(token, secret, algorithms=[ALGORITHM])
    except JWTError:
        #return None if signature is invalid, token has expired etc.
        return None