"""Database tables.

users 1--* categories 1--* transactions
users 1--* budgets (one monthly limit per expense category)
"""
from datetime import date, datetime

from sqlalchemy import (
    Column, Date, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("user_id", "name", "type", name="uq_category"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(60), nullable=False)
    type = Column(String(10), nullable=False)  # "income" or "expense"
    color = Column(String(9), nullable=False, default="#10b981")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True, nullable=False)
    type = Column(String(10), nullable=False)  # copied from category so queries stay simple
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String(200), nullable=False, default="")
    date = Column(Date, nullable=False, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category")


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("user_id", "category_id", name="uq_budget"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)  # monthly limit

    category = relationship("Category")
