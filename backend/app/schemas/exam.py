from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ExamCreate(BaseModel):
    """
    request model used when creating a new exam countdown.
    """
    name: str = Field(min_length=1, max_length=200)
    subject: str | None = Field(default=None, max_length=100)
    exam_date: datetime


class ExamResponse(BaseModel):
    """
    response model returned when exam data is requested.
    includes the exam details and the created_at timestamp.
    """
    id: UUID
    user_id: UUID
    name: str
    subject: str | None
    exam_date: datetime
    created_at: datetime

    model_config = {
        "from_attributes": True
    }