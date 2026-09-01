import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummary)
def summary(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    cards = db.query(models.CreditCard).filter(
        models.CreditCard.user_id == current_user.id, models.CreditCard.is_active == True  # noqa: E712
    ).all()
    emis = db.query(models.EMI).filter(
        models.EMI.user_id == current_user.id, models.EMI.is_active == True  # noqa: E712
    ).all()
    reminders = db.query(models.Reminder).filter(
        models.Reminder.user_id == current_user.id, models.Reminder.is_completed == False  # noqa: E712
    ).all()

    total_limit = sum(c.credit_limit or 0 for c in cards)
    total_used = sum(c.used_amount or 0 for c in cards)
    total_available = max(total_limit - total_used, 0)
    overall_util = round((total_used / total_limit) * 100, 1) if total_limit else 0.0
    over_30 = sum(1 for c in cards if c.utilization_pct > 30)
    over_70 = sum(1 for c in cards if c.utilization_pct > 70)

    total_emi = sum(e.emi_amount or 0 for e in emis)

    today = datetime.date.today()
    week_out = today + datetime.timedelta(days=7)

    today_reminders = [r for r in reminders if r.due_date == today]
    upcoming_7d = [r for r in reminders if today < r.due_date <= week_out]
    missed = [r for r in reminders if r.due_date < today]

    return schemas.DashboardSummary(
        total_credit_limit=total_limit,
        total_credit_used=total_used,
        total_credit_available=total_available,
        overall_utilization_pct=overall_util,
        cards_over_30pct=over_30,
        cards_over_70pct=over_70,
        total_monthly_emi=total_emi,
        upcoming_reminders_7d=upcoming_7d,
        today_reminders=today_reminders,
        missed_reminders=missed,
        total_monthly_commitments=total_emi,
    )
