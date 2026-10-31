from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Budget, Category, Transaction, User
from ..schemas import BudgetIn, BudgetOut
from ..security import get_current_user
from .analytics import month_range, parse_month

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetOut])
def list_budgets(month: Optional[str] = None, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    """Each budget with how much was spent in the chosen month."""
    y, m = parse_month(month)
    start, end = month_range(y, m)
    spent_rows = (db.query(Transaction.category_id, func.sum(Transaction.amount))
                  .filter(Transaction.user_id == user.id, Transaction.type == "expense",
                          Transaction.date >= start, Transaction.date < end)
                  .group_by(Transaction.category_id).all())
    spent = {cid: float(total) for cid, total in spent_rows}

    budgets = (db.query(Budget).options(joinedload(Budget.category))
               .filter(Budget.user_id == user.id).all())
    result = []
    for b in budgets:
        limit = float(b.amount)
        s = spent.get(b.category_id, 0.0)
        result.append(BudgetOut(
            category_id=b.category_id, category_name=b.category.name, color=b.category.color,
            limit=limit, spent=s, percent=round(s / limit * 100, 1) if limit else 0.0,
        ))
    result.sort(key=lambda r: r.percent, reverse=True)
    return result


@router.put("/{category_id}", response_model=BudgetIn)
def set_budget(category_id: int, data: BudgetIn, db: Session = Depends(get_db),
               user: User = Depends(get_current_user)):
    """Create or update (upsert) the monthly limit for one expense category."""
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user.id).first()
    if not cat or cat.type != "expense":
        raise HTTPException(400, "Budgets can only be set on your expense categories")
    budget = db.query(Budget).filter(Budget.user_id == user.id, Budget.category_id == category_id).first()
    if budget:
        budget.amount = data.amount
    else:
        db.add(Budget(user_id=user.id, category_id=category_id, amount=data.amount))
    db.commit()
    return data


@router.delete("/{category_id}", status_code=204)
def delete_budget(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    budget = db.query(Budget).filter(Budget.user_id == user.id, Budget.category_id == category_id).first()
    if not budget:
        raise HTTPException(404, "Budget not found")
    db.delete(budget)
    db.commit()
