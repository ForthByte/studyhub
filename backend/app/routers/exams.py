from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.exam import Exam
from app.models.user import User
from app.schemas.exam import ExamCreate, ExamResponse

router = APIRouter(prefix="/api/v1/exams", tags=["exams"])


@router.get("", response_model=list[ExamResponse])
def list_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all upcoming exams for the current user.
    returns exams ordered by exam date ascending so the nearest exam appears first.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting their exams.
    :return: list of exams ordered by date ascending.
    """
    return (
        db.query(Exam)
        .filter(Exam.user_id == current_user.id)
        .order_by(Exam.exam_date.asc())
        .all()
    )


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    exam_in: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    create a new exam countdown for the current user.
    :param exam_in: exam creation data including name, subject and date.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user creating the exam.
    :return: the newly created exam.
    """
    exam = Exam(
        user_id=current_user.id,
        name=exam_in.name,
        subject=exam_in.subject,
        exam_date=exam_in.exam_date,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    delete an exam countdown.
    users can only delete their own exams.
    :param exam_id: the ID of the exam to delete.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user deleting the exam.
    :return: no response body if successful.
    """
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.user_id == current_user.id,
    ).first()

    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    db.delete(exam)
    db.commit()
    return None