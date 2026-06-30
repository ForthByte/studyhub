import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    """
    represent the database model of a user entity.
    defines the database schema, constraints and field types for 'users' table
    :param id: unique primary key identifier for the user. Auto generated as a UUIDv4
    :param email: unique and indexed email address string used for user authentication.
    :param username: unique and indexed display name chosen by the user.
    :param hashed_password: secure bcrypt hash string of the user's password.
    :param created_at: timestamp indicating when the user account was created, defaulting to the server's local current time.
    :param messages: chat messages authored by this user.
    :param sent_requests: friend requests sent by this user.
    :param received_requests: friend requests received by this user.
    :param sent_dms: direct messages sent by this user.
    :param received_dms: direct messages received by this user.
    """
    __tablename__ = 'users'

    #Postgres key using PostgreSQL native UUID types
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    #the core user identification fields with performance boosting indexes
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)

    #secure authenticated payload
    hashed_password = Column(String, nullable=False)

    # audit timestamp tracking account creation
    created_at = Column(DateTime(timezone=True), default=func.now())

    # relationships
    messages = relationship("Message", back_populates="author")

    # friendship relationships
    sent_requests = relationship("Friendship", foreign_keys="Friendship.requester_id", back_populates="requester")
    received_requests = relationship("Friendship", foreign_keys="Friendship.addressee_id", back_populates="addressee")

    # direct message relationships
    sent_dms = relationship("DirectMessage", foreign_keys="DirectMessage.sender_id", back_populates="sender")
    received_dms = relationship("DirectMessage", foreign_keys="DirectMessage.recipient_id", back_populates="recipient")