from typing import Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class NoteCreate(BaseModel):
    title: str = Field(description="Untitled", max_length=200)
    content: dict [str, Any] = Field(default_factory=dict)

class NoteUpdate(BaseModel):
    title: str| None = Field(description="Untitled", max_length=200)
    content: dict [str, Any] | None = None

class NoteResponse(BaseModel):
    id: UUID
    title: str
    content: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class config:
        from_attributes = True