from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.exam import Exam
from app.models.group import GroupMember, GroupRole
from app.models.user import User
from app.schemas.exam import ExamCreate, ExamResponse

router = APIRouter(prefix="/api/v1/groups", tags=["group-exams"])


@router.get("/{group_id}/exams", response_model=list[ExamResponse])
def list_group_exams(
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    retrieve all exams for a specific group.
    only group members can view group exams.
    :param group_id: the group to fetch exams for.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user requesting the exams.
    :return: list of group exams ordered by date ascending.
    """
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
    ).first()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )

    return (
        db.query(Exam)
        .filter(Exam.group_id == group_id)
        .order_by(Exam.exam_date.asc())
        .all()
    )


@router.post("/{group_id}/exams", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_group_exam(
    group_id: UUID,
    exam_in: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    create a new exam for a study group.
    only group admins and owners can create group exams.
    the exam will be visible to all members of the group.
    :param group_id: the group to create the exam for.
    :param exam_in: exam creation data including name, subject and date.
    :param db: SQLAlchemy database session dependency.
    :param current_user: authenticated user creating the exam.
    :return: the newly created group exam.
    """
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
    ).first()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )

    if membership.role == GroupRole.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admins and owners can create group exams",
        )

    exam = Exam(
        user_id=current_user.id,
        group_id=group_id,
        name=exam_in.name,
        subject=exam_in.subject,
        exam_date=exam_in.exam_date,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam