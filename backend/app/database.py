"""Database connection. Works with SQLite (default) or Postgres via DATABASE_URL."""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance.db").strip()

# Tolerate a value pasted straight from a provider's "copy" button, e.g.  psql 'postgresql://...'
if DATABASE_URL.lower().startswith("psql"):
    DATABASE_URL = DATABASE_URL[4:].strip()
DATABASE_URL = DATABASE_URL.strip("'\"").strip()

# Some hosts give "postgres://" but SQLAlchemy wants "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Use the psycopg 3 driver for Postgres (it ships ready-made wheels, which suits Vercel)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# SQLite needs this flag because FastAPI uses multiple threads
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    """FastAPI dependency: gives each request its own DB session, then closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()