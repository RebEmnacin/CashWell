# CashWell — Personal Finance Tracker

Log income and expenses, set monthly budgets, and see where your money goes on a live dashboard.

**Stack:** React + TypeScript · Vite · Tailwind CSS v4 · Zustand · React Router · Axios · Recharts · React Spring · FastAPI · SQLAlchemy · PostgreSQL (SQLite for local dev)

## Features

- Sign up / log in (JWT auth, bcrypt-hashed passwords) and a one-click **demo account** with 6 months of sample data
- Add, edit, delete transactions with categories
- Search, filter (type, category, date range) and paginate
- **Export to CSV** (respects your current filters)
- Monthly **budgets** with progress bars (green → amber → red)
- **Dashboard**: net balance, income, expenses, savings rate, change vs last month, income-vs-expense chart, spending-by-category donut, recent activity
- Animated number counters, smooth modal and progress bars (React Spring), responsive layout with mobile tab bar

## Why this stack

| Tech | Why |
|---|---|
| React + TypeScript + Vite | Fast dev server; TypeScript catches mistakes in money and date handling |
| Zustand | Tiny store, used here for the login session (persisted to localStorage) |
| Tailwind v4 | Quick, consistent styling for cards, tables and forms |
| Recharts | Simple chart components that plug straight into React |
| React Spring | Physics-based animation for counters, modal and progress bars |
| FastAPI | Python, automatic validation (Pydantic) and free API docs at `/docs` |
| SQLAlchemy + Postgres | Dashboard numbers are `GROUP BY` / `SUM` queries; Postgres excels at that |
| SQLite fallback | Run the project with zero database setup |

## Run it locally

You need **Python 3.10+** and **Node 18+**.

### 1. Backend (terminal 1)

```bash
cd backend
python -m venv venv

Required:
# Windows: venv\Scripts\activate     Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
uvicorn app.main:app --reload
```

API runs at http://localhost:8000 — interactive docs at http://localhost:8000/docs.
Tables are created automatically on first start (a `finance.db` file appears).

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and click **Try the demo account**.

### Use Postgres (e.g. NeonDB) instead of SQLite

In `backend/.env`, set:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Restart the backend. No code changes needed.

## Deploy

- **Backend:** Render / Railway / Fly.io. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `DATABASE_URL`, `SECRET_KEY` and `CORS_ORIGINS` (your frontend URL).
- **Frontend:** Vercel / Netlify. Build command `npm run build`, output `dist`. Set `VITE_API_URL=https://<your-backend>/api`. Add a rewrite of all paths to `/index.html` (React Router).

## Project structure

```
backend/app/
  main.py          app + CORS + routers
  database.py      engine/session (SQLite or Postgres)
  models.py        tables: users, categories, transactions, budgets
  schemas.py       request/response validation
  security.py      bcrypt, JWT, get_current_user
  seed.py          default categories + demo data
  routers/         auth, categories, transactions, budgets, analytics
frontend/src/
  api/             axios client + endpoint functions
  store/           zustand auth store
  pages/           Login, Dashboard, Transactions, Budgets
  components/      Layout, TransactionModal, AnimatedNumber, PageHeader
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` `/login` `/demo` | Create account, log in, demo account |
| GET | `/api/auth/me` | Current user |
| GET/POST/DELETE | `/api/categories` | Manage categories |
| GET/POST/PUT/DELETE | `/api/transactions` | CRUD + filters + pagination |
| GET | `/api/transactions/export` | CSV download |
| GET | `/api/budgets?month=YYYY-MM` | Budgets with amount spent |
| PUT/DELETE | `/api/budgets/{category_id}` | Set (upsert) or remove a budget |
| GET | `/api/analytics/summary` `/by-category` `/monthly` | Dashboard data |

## Hard problems worth writing about

1. **Data isolation.** Every query filters by `user_id`, and category ownership is re-checked on every write so one user can't attach a transaction to another user's category.
2. **Server decides the type.** A transaction's `income`/`expense` type is copied from its category on the server, never trusted from the client.
3. **Aggregation in SQL.** Totals, per-category sums and the 6-month chart use `GROUP BY` + `SUM` in the database, not loops in Python. Empty months are filled with zeros so the chart has no gaps.
4. **Date-range bugs.** Month queries use `date >= first_of_month AND date < first_of_next_month` (end exclusive) so no day is missed or double counted.
5. **Debounced search.** The search box waits 350 ms after typing stops so the API isn't called on every keystroke.

## Learn-later checklist

Things to study when you review the code line by line:

- [ ] How `Depends(get_db)` and `Depends(get_current_user)` work in FastAPI
- [ ] How a JWT is created and verified (`security.py`)
- [ ] SQLAlchemy `group_by`, `func.sum`, `joinedload` (`routers/analytics.py`, `transactions.py`)
- [ ] How the Axios interceptor adds the token (`api/client.ts`)
- [ ] Zustand `persist` middleware (`store/authStore.ts`)
- [ ] `useEffect` + `useCallback` data loading pattern (`pages/Dashboard.tsx`)
- [ ] `useSpring` / `useTransition` from React Spring

## Ideas to extend it

- Recurring transactions (rent, subscriptions)
- Custom category management screen
- Pytest tests for the API and a Playwright end-to-end test
- Docker Compose (API + Postgres) and a GitHub Actions CI workflow
- Dark mode, multiple currencies, receipt image upload
