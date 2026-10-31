import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .database import Base, engine  # noqa: E402  (after load_dotenv so .env is read)
from .routers import analytics, auth, budgets, categories, transactions  # noqa: E402

Base.metadata.create_all(bind=engine)  # creates tables on first run

app = FastAPI(title="Finance Tracker API", version="1.0.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, categories, transactions, budgets, analytics):
    app.include_router(r.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
