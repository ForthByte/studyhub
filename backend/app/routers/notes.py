from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/api/v1/notes", tags=["notes"])


def _get_owned_note(note_id: UUID, db: Session, current_user: User) -> Note:
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note or note.owner_id != current_user.id:
        # 404 either way — don't leak whether a note exists if it isn't yours
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = Note(owner_id=current_user.id, title=note_in.title, content=note_in.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("", response_model=list[NoteResponse])
def list_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Note)
        .filter(Note.owner_id == current_user.id)
        .order_by(Note.updated_at.desc())
        .all()
    )


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_note(note_id, db, current_user)


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: UUID,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, db, current_user)
    if note_in.title is not None:
        note.title = note_in.title
    if note_in.content is not None:
        note.content = note_in.content
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, db, current_user)
    db.delete(note)
    db.commit()