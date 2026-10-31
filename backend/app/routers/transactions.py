import csv
import io
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Category, Transaction, User
from ..schemas import TransactionIn, TransactionOut, TransactionPage
from ..security import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _filtered_query(db: Session, user: User, type: Optional[str], category_id: Optional[int],
                    start: Optional[date], end: Optional[date], search: Optional[str]):
    q = (db.query(Transaction).options(joinedload(Transaction.category))
         .filter(Transaction.user_id == user.id))
    if type in ("income", "expense"):
        q = q.filter(Transaction.type == type)
    if category_id:
        q = q.filter(Transaction.category_id == category_id)
    if start:
        q = q.filter(Transaction.date >= start)
    if end:
        q = q.filter(Transaction.date <= end)
    if search:
        q = q.filter(Transaction.description.ilike(f"%{search}%"))
    return q


def _own_category(db: Session, user: User, category_id: int) -> Category:
    """Security: make sure the category belongs to the logged-in user."""
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user.id).first()
    if not cat:
        raise HTTPException(400, "Invalid category")
    return cat


@router.get("", response_model=TransactionPage)
def list_transactions(
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    start: Optional[date] = None,
    end: Optional[date] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = _filtered_query(db, user, type, category_id, start, end, search)
    total = q.count()
    items = (q.order_by(Transaction.date.desc(), Transaction.id.desc())
             .offset((page - 1) * limit).limit(limit).all())
    return {"items": items, "total": total}


@router.get("/export")
def export_csv(
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    start: Optional[date] = None,
    end: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = (_filtered_query(db, user, type, category_id, start, end, search)
            .order_by(Transaction.date.desc(), Transaction.id.desc()).all())
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Date", "Type", "Category", "Description", "Amount"])
    for t in rows:
        writer.writerow([t.date.isoformat(), t.type, t.category.name, t.description, f"{t.amount:.2f}"])
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="transactions.csv"'},
    )


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = _own_category(db, user, data.category_id)
    # type comes from the category, never trusted from the client
    tx = Transaction(user_id=user.id, category_id=cat.id, type=cat.type,
                     amount=data.amount, description=data.description.strip(), date=data.date)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def _own_transaction(db: Session, user: User, tx_id: int) -> Transaction:
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user.id).first()
    if not tx:
        raise HTTPException(404, "Transaction not found")
    return tx


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(tx_id: int, data: TransactionIn, db: Session = Depends(get_db),
                       user: User = Depends(get_current_user)):
    tx = _own_transaction(db, user, tx_id)
    cat = _own_category(db, user, data.category_id)
    tx.category_id, tx.type = cat.id, cat.type
    tx.amount, tx.description, tx.date = data.amount, data.description.strip(), data.date
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=204)
def delete_transaction(tx_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tx = _own_transaction(db, user, tx_id)
    db.delete(tx)
    db.commit()
