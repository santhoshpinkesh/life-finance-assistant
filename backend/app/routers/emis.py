from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/emis", tags=["emis"])


@router.get("", response_model=list[schemas.EMIOut])
def list_emis(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.EMI).filter(models.EMI.user_id == current_user.id).all()


@router.post("", response_model=schemas.EMIOut, status_code=201)
def create_emi(
    payload: schemas.EMICreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    emi = models.EMI(**payload.model_dump(), user_id=current_user.id)
    db.add(emi)
    db.commit()
    db.refresh(emi)
    return emi


def _get_emi_or_404(emi_id: str, db: Session, user: models.User) -> models.EMI:
    emi = db.query(models.EMI).filter(
        models.EMI.id == emi_id, models.EMI.user_id == user.id
    ).first()
    if not emi:
        raise HTTPException(status_code=404, detail="EMI not found")
    return emi


@router.patch("/{emi_id}", response_model=schemas.EMIOut)
def update_emi(
    emi_id: str,
    payload: schemas.EMIUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    emi = _get_emi_or_404(emi_id, db, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(emi, field, value)
    db.commit()
    db.refresh(emi)
    return emi


@router.delete("/{emi_id}", status_code=204)
def delete_emi(
    emi_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    emi = _get_emi_or_404(emi_id, db, current_user)
    db.delete(emi)
    db.commit()
