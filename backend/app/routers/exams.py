from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.exam import Exam
from app.models.group import GroupMember, GroupRole
from app.models.user import User
from app.schemas.exam import ExamCreate, ExamResponse

router = APIRouter(prefix="/api/v1/exams", tags=["exams"])


@router.get("", response_model=list[ExamResponse])
def list_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all exams visible to the current user.
    includes personal exams (group_id = null) and all group exams
    from groups the user is a member of, ordered by exam date ascending.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting their exams.
    :return: list of exams ordered by date ascending.
    """
    # get all group IDs the user is a member of
    memberships = db.query(GroupMember).filter(
        GroupMember.user_id == current_user.id
    ).all()
    group_ids = [m.group_id for m in memberships]

    # fetch personal exams + group exams from groups the user belongs to
    exams = (
        db.query(Exam)
        .filter(
            (Exam.user_id == current_user.id) & (Exam.group_id == None) |
            (Exam.group_id.in_(group_ids))
        )
        .order_by(Exam.exam_date.asc())
        .all()
    )

    return exams


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_personal_exam(
    exam_in: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    create a new personal exam countdown for the current user.
    personal exams have no group_id and are only visible to the creator.
    :param exam_in: exam creation data including name, subject and date.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user creating the exam.
    :return: the newly created exam.
    """
    exam = Exam(
        user_id=current_user.id,
        group_id=None,
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
    personal exams can only be deleted by their creator.
    group exams can only be deleted by group admins and owners.
    :param exam_id: the ID of the exam to delete.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user deleting the exam.
    :return: no response body if successful.
    """
    exam = db.query(Exam).filter(Exam.id == exam_id).first()

    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )

    # personal exam — only the creator can delete
    if exam.group_id is None:
        if exam.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own exams",
            )
    else:
        # group exam — only admins and owners can delete
        membership = db.query(GroupMember).filter(
            GroupMember.group_id == exam.group_id,
            GroupMember.user_id == current_user.id,
        ).first()

        if membership is None or membership.role == GroupRole.member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only group admins and owners can delete group exams",
            )

    db.delete(exam)
    db.commit()
    return None