import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Exam(Base):
    """
    represents an upcoming exam added by a user.
    used to display countdown timers on the dashboard.
    exams are personal — each user manages their own exam list.
    :param id: unique identifier for the exam.
    :param user_id: the user who created the exam.
    :param group_id: the group this exam belongs to, or None if it is a personal exam.
    :param name: name of the exam e.g. 'Algorithms Final'.
    :param subject: subject or module e.g. 'Computer Science'.
    :param exam_date: the date and time of the exam.
    :param created_at: timestamp when the exam was added.
    """
    __tablename__ = "exams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=True)
    exam_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # relationships
    owner = relationship("User", back_populates="exams")
    group = relationship("Group", back_populates="exams")