"""Pydantic schemas = what the API accepts (In) and returns (Out). They validate input."""
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

TxType = Literal["income", "expense"]


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Auth ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserOut(ORM):
    id: int
    name: str
    email: str


class UpdateProfileIn(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    current_password: str | None = Field(default=None, max_length=128)  # needed only when the email changes


class ChangePasswordIn(BaseModel):
    current_password: str = Field(max_length=128)
    new_password: str = Field(min_length=6, max_length=128)


class DeleteAccountIn(BaseModel):
    password: str = Field(max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Categories ----------
class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    type: TxType
    color: str = Field(default="#10b981", pattern=r"^#[0-9a-fA-F]{6}$")


class CategoryOut(ORM):
    id: int
    name: str
    type: TxType
    color: str


# ---------- Transactions ----------
class TransactionIn(BaseModel):
    category_id: int
    amount: float = Field(gt=0, le=1_000_000_000)
    description: str = Field(default="", max_length=200)
    date: date


class TransactionOut(ORM):
    id: int
    category_id: int
    type: TxType
    amount: float
    description: str
    date: date
    category: CategoryOut


class TransactionPage(BaseModel):
    items: list[TransactionOut]
    total: int


# ---------- Budgets ----------
class BudgetIn(BaseModel):
    amount: float = Field(gt=0, le=1_000_000_000)


class BudgetOut(BaseModel):
    category_id: int
    category_name: str
    color: str
    limit: float
    spent: float
    percent: float


# ---------- Analytics ----------
class SummaryOut(BaseModel):
    month: str
    income: float
    expense: float
    balance: float
    savings_rate: float
    prev_income: float
    prev_expense: float
    transaction_count: int


class CategoryTotal(BaseModel):
    category_id: int
    name: str
    color: str
    total: float


class MonthlyPoint(BaseModel):
    month: str
    label: str
    income: float
    expense: float