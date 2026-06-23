import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """
    represent the database model of a user entity.
    defines the database schema, constraints and field types for 'users' table
    :param id: unique primary key identifier for the user. Auto generated as a UUIDv4
    :param email: unique and indexed email address string used for user authentication.
    :param username: unique and indexed display name chosen by the user.
    :param hashed_password: secure bcrypt hash string of the user's password.
    :param created_at: timestamp indicating when the user account was created, defaulting to the server's local current time.
    """
    __tablename__ = 'users'

    #Postgres key using PostgreSQL native UUID types
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    #the core user identification fields with performance boosting indexes
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)

    #secure authenticated payload
    hashed_password = Column(String, nullable=False)

    #audit timestamp tracking account creation
    created_at = Column(DateTime(timezone=True), default=func.now())