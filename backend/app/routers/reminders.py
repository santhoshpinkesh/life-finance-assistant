from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.get("", response_model=list[schemas.ReminderOut])
def list_reminders(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Reminder).filter(
        models.Reminder.user_id == current_user.id
    ).order_by(models.Reminder.due_date.asc()).all()


@router.post("", response_model=schemas.ReminderOut, status_code=201)
def create_reminder(
    payload: schemas.ReminderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    reminder = models.Reminder(**payload.model_dump(), user_id=current_user.id)
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def _get_reminder_or_404(reminder_id: str, db: Session, user: models.User) -> models.Reminder:
    reminder = db.query(models.Reminder).filter(
        models.Reminder.id == reminder_id, models.Reminder.user_id == user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.patch("/{reminder_id}", response_model=schemas.ReminderOut)
def update_reminder(
    reminder_id: str,
    payload: schemas.ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    reminder = _get_reminder_or_404(reminder_id, db, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(reminder, field, value)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    reminder = _get_reminder_or_404(reminder_id, db, current_user)
    db.delete(reminder)
    db.commit()
