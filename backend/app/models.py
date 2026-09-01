import datetime
import enum
import uuid

from sqlalchemy import (
    Column, String, Float, Integer, Date, DateTime, ForeignKey, Boolean, Enum
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    credit_cards = relationship("CreditCard", back_populates="owner", cascade="all, delete-orphan")
    emis = relationship("EMI", back_populates="owner", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="owner", cascade="all, delete-orphan")


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    bank = Column(String, nullable=False)
    card_name = Column(String, nullable=False)
    card_last4 = Column(String, nullable=True)
    network = Column(String, nullable=True)  # Visa / Mastercard / Amex / RuPay
    credit_limit = Column(Float, nullable=False, default=0)
    used_amount = Column(Float, nullable=False, default=0)
    statement_date = Column(Integer, nullable=True)  # day of month 1-31
    due_date = Column(Integer, nullable=True)  # day of month 1-31
    interest_rate = Column(Float, nullable=True)
    min_due = Column(Float, nullable=True)
    reward_points = Column(Integer, nullable=True, default=0)
    annual_fee = Column(Float, nullable=True, default=0)
    color = Column(String, nullable=True, default="#10B981")
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="credit_cards")

    @property
    def available_limit(self) -> float:
        return max((self.credit_limit or 0) - (self.used_amount or 0), 0)

    @property
    def utilization_pct(self) -> float:
        if not self.credit_limit:
            return 0.0
        return round((self.used_amount / self.credit_limit) * 100, 1)


class LoanType(str, enum.Enum):
    emi = "emi"
    loan = "loan"


class EMI(Base):
    __tablename__ = "emis"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    loan_name = Column(String, nullable=False)
    bank = Column(String, nullable=True)
    loan_type = Column(Enum(LoanType), default=LoanType.emi)
    emi_amount = Column(Float, nullable=False)
    emi_day = Column(Integer, nullable=False)  # day of month 1-31
    interest_rate = Column(Float, nullable=True)
    outstanding_principal = Column(Float, nullable=True)
    tenure_months = Column(Integer, nullable=True)
    remaining_months = Column(Integer, nullable=True)
    total_paid = Column(Float, nullable=True, default=0)
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="emis")


class ReminderCategory(str, enum.Enum):
    credit_card = "credit_card"
    emi = "emi"
    bill = "bill"
    subscription = "subscription"
    document = "document"
    insurance = "insurance"
    investment = "investment"
    other = "other"


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    category = Column(Enum(ReminderCategory), default=ReminderCategory.other)
    due_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurrence_days = Column(Integer, nullable=True)  # e.g. 30 for monthly
    is_completed = Column(Boolean, default=False)
    linked_credit_card_id = Column(String, ForeignKey("credit_cards.id"), nullable=True)
    linked_emi_id = Column(String, ForeignKey("emis.id"), nullable=True)

    owner = relationship("User", back_populates="reminders")
