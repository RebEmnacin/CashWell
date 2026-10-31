"""Dashboard numbers. These use SQL GROUP BY + SUM so the database does the heavy lifting."""
from calendar import month_abbr
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, Transaction, User
from ..schemas import CategoryTotal, MonthlyPoint, SummaryOut
from ..security import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


def parse_month(month: Optional[str]) -> tuple[int, int]:
    """'2026-10' -> (2026, 10). Defaults to the current month."""
    if not month:
        t = date.today()
        return t.year, t.month
    try:
        y, m = month.split("-")
        y, m = int(y), int(m)
        if not 1 <= m <= 12:
            raise ValueError
        return y, m
    except ValueError:
        raise HTTPException(400, "month must look like 2026-10")


def month_range(y: int, m: int) -> tuple[date, date]:
    """First day of the month and first day of the NEXT month (end is exclusive)."""
    start = date(y, m, 1)
    end = date(y + 1, 1, 1) if m == 12 else date(y, m + 1, 1)
    return start, end


def shift_month(y: int, m: int, delta: int) -> tuple[int, int]:
    total = y * 12 + (m - 1) + delta
    return total // 12, total % 12 + 1


def totals_for(db: Session, user: User, y: int, m: int) -> dict:
    start, end = month_range(y, m)
    rows = (db.query(Transaction.type, func.coalesce(func.sum(Transaction.amount), 0), func.count(Transaction.id))
            .filter(Transaction.user_id == user.id, Transaction.date >= start, Transaction.date < end)
            .group_by(Transaction.type).all())
    out = {"income": 0.0, "expense": 0.0, "count": 0}
    for type_, total, count in rows:
        out[type_] = float(total)
        out["count"] += count
    return out


@router.get("/summary", response_model=SummaryOut)
def summary(month: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    y, m = parse_month(month)
    cur = totals_for(db, user, y, m)
    py, pm = shift_month(y, m, -1)
    prev = totals_for(db, user, py, pm)
    balance = cur["income"] - cur["expense"]
    savings_rate = (balance / cur["income"] * 100) if cur["income"] > 0 else 0.0
    return SummaryOut(
        month=f"{y}-{m:02d}", income=cur["income"], expense=cur["expense"], balance=balance,
        savings_rate=round(savings_rate, 1), prev_income=prev["income"], prev_expense=prev["expense"],
        transaction_count=cur["count"],
    )


@router.get("/by-category", response_model=list[CategoryTotal])
def by_category(month: Optional[str] = None, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    """Expense totals per category for one month (powers the donut chart)."""
    y, m = parse_month(month)
    start, end = month_range(y, m)
    rows = (db.query(Category.id, Category.name, Category.color, func.sum(Transaction.amount))
            .join(Transaction, Transaction.category_id == Category.id)
            .filter(Transaction.user_id == user.id, Transaction.type == "expense",
                    Transaction.date >= start, Transaction.date < end)
            .group_by(Category.id, Category.name, Category.color)
            .order_by(func.sum(Transaction.amount).desc()).all())
    return [CategoryTotal(category_id=r[0], name=r[1], color=r[2], total=float(r[3])) for r in rows]


@router.get("/monthly", response_model=list[MonthlyPoint])
def monthly(months: int = Query(6, ge=1, le=24), db: Session = Depends(get_db),
            user: User = Depends(get_current_user)):
    """Income vs expense for the last N months (powers the bar chart)."""
    today = date.today()
    sy, sm = shift_month(today.year, today.month, -(months - 1))
    start = date(sy, sm, 1)
    rows = (db.query(extract("year", Transaction.date), extract("month", Transaction.date),
                     Transaction.type, func.sum(Transaction.amount))
            .filter(Transaction.user_id == user.id, Transaction.date >= start)
            .group_by(extract("year", Transaction.date), extract("month", Transaction.date), Transaction.type)
            .all())
    lookup = {(int(r[0]), int(r[1]), r[2]): float(r[3]) for r in rows}

    result = []
    for i in range(months):  # fill empty months with zeros so the chart has no gaps
        y, m = shift_month(sy, sm, i)
        result.append(MonthlyPoint(
            month=f"{y}-{m:02d}", label=month_abbr[m],
            income=lookup.get((y, m, "income"), 0.0), expense=lookup.get((y, m, "expense"), 0.0),
        ))
    return result
