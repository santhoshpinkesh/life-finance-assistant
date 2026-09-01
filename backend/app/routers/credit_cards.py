from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/credit-cards", tags=["credit-cards"])


@router.get("", response_model=list[schemas.CreditCardOut])
def list_cards(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.CreditCard).filter(
        models.CreditCard.user_id == current_user.id
    ).all()


@router.post("", response_model=schemas.CreditCardOut, status_code=201)
def create_card(
    payload: schemas.CreditCardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    card = models.CreditCard(**payload.model_dump(), user_id=current_user.id)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def _get_card_or_404(card_id: str, db: Session, user: models.User) -> models.CreditCard:
    card = db.query(models.CreditCard).filter(
        models.CreditCard.id == card_id, models.CreditCard.user_id == user.id
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return card


@router.patch("/{card_id}", response_model=schemas.CreditCardOut)
def update_card(
    card_id: str,
    payload: schemas.CreditCardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    card = _get_card_or_404(card_id, db, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(card, field, value)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def delete_card(
    card_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    card = _get_card_or_404(card_id, db, current_user)
    db.delete(card)
    db.commit()
