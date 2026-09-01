import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

from .models import LoanType, ReminderCategory


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    full_name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Credit Cards ----------
class CreditCardBase(BaseModel):
    bank: str
    card_name: str
    card_last4: Optional[str] = None
    network: Optional[str] = None
    credit_limit: float = 0
    used_amount: float = 0
    statement_date: Optional[int] = None
    due_date: Optional[int] = None
    interest_rate: Optional[float] = None
    min_due: Optional[float] = None
    reward_points: Optional[int] = 0
    annual_fee: Optional[float] = 0
    color: Optional[str] = "#10B981"


class CreditCardCreate(CreditCardBase):
    pass


class CreditCardUpdate(BaseModel):
    bank: Optional[str] = None
    card_name: Optional[str] = None
    card_last4: Optional[str] = None
    network: Optional[str] = None
    credit_limit: Optional[float] = None
    used_amount: Optional[float] = None
    statement_date: Optional[int] = None
    due_date: Optional[int] = None
    interest_rate: Optional[float] = None
    min_due: Optional[float] = None
    reward_points: Optional[int] = None
    annual_fee: Optional[float] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class CreditCardOut(CreditCardBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_active: bool
    available_limit: float
    utilization_pct: float


# ---------- EMI ----------
class EMIBase(BaseModel):
    loan_name: str
    bank: Optional[str] = None
    loan_type: LoanType = LoanType.emi
    emi_amount: float
    emi_day: int
    interest_rate: Optional[float] = None
    outstanding_principal: Optional[float] = None
    tenure_months: Optional[int] = None
    remaining_months: Optional[int] = None
    total_paid: Optional[float] = 0


class EMICreate(EMIBase):
    pass


class EMIUpdate(BaseModel):
    loan_name: Optional[str] = None
    bank: Optional[str] = None
    loan_type: Optional[LoanType] = None
    emi_amount: Optional[float] = None
    emi_day: Optional[int] = None
    interest_rate: Optional[float] = None
    outstanding_principal: Optional[float] = None
    tenure_months: Optional[int] = None
    remaining_months: Optional[int] = None
    total_paid: Optional[float] = None
    is_active: Optional[bool] = None


class EMIOut(EMIBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_active: bool


# ---------- Reminders ----------
class ReminderBase(BaseModel):
    title: str
    category: ReminderCategory = ReminderCategory.other
    due_date: datetime.date
    amount: Optional[float] = None
    notes: Optional[str] = None
    is_recurring: bool = False
    recurrence_days: Optional[int] = None
    linked_credit_card_id: Optional[str] = None
    linked_emi_id: Optional[str] = None


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[ReminderCategory] = None
    due_date: Optional[datetime.date] = None
    amount: Optional[float] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_days: Optional[int] = None
    is_completed: Optional[bool] = None


class ReminderOut(ReminderBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_completed: bool


# ---------- Dashboard ----------
class DashboardSummary(BaseModel):
    total_credit_limit: float
    total_credit_used: float
    total_credit_available: float
    overall_utilization_pct: float
    cards_over_30pct: int
    cards_over_70pct: int
    total_monthly_emi: float
    upcoming_reminders_7d: list[ReminderOut]
    today_reminders: list[ReminderOut]
    missed_reminders: list[ReminderOut]
    total_monthly_commitments: float
