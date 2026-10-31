from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, Transaction, User
from ..schemas import CategoryIn, CategoryOut
from ..security import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (db.query(Category).filter(Category.user_id == user.id)
            .order_by(Category.type.desc(), Category.name).all())


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = Category(user_id=user.id, **data.model_dump())
    db.add(cat)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "You already have a category with that name")
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user.id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    if db.query(Transaction).filter(Transaction.category_id == cat.id).first():
        raise HTTPException(400, "This category has transactions; delete or move them first")
    db.delete(cat)
    db.commit()
