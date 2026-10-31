from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import RegisterIn, TokenOut, UserOut
from ..security import create_access_token, get_current_user, hash_password, verify_password
from ..seed import create_default_categories, seed_demo_data

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_EMAIL = "demo@financetracker.dev"


def _token_response(user: User) -> TokenOut:
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/register", response_model=TokenOut, status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "That email is already registered")
    user = User(name=data.name.strip(), email=email, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()
    create_default_categories(db, user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 form calls the email field "username"
    user = db.query(User).filter(User.email == form.username.lower()).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return _token_response(user)


@router.post("/demo", response_model=TokenOut)
def demo_login(db: Session = Depends(get_db)):
    """One-click demo account with 6 months of sample data (for recruiters)."""
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if not user:
        user = User(name="Demo User", email=DEMO_EMAIL, password_hash=hash_password("demo-not-for-login"))
        db.add(user)
        db.flush()
        cats = create_default_categories(db, user)
        seed_demo_data(db, user, cats)
        db.commit()
        db.refresh(user)
    return _token_response(user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
