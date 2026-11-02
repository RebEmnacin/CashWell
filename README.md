<div align="center">

<img src="frontend/public/CashWell_Logo.png" alt="CashWell logo" width="96" />

# CashWell

**A personal finance tracker that shows you where your money goes.**

Log income and expenses, set monthly budgets, and watch a live dashboard update as you go.

![React](https://img.shields.io/badge/React_19-20232a?logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06b6d4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?logo=postgresql&logoColor=white)

[Live demo](#) · [Features](#features) · [Run it locally](SETUP.md) · [API](#api-overview)

</div>

---

## Screenshots

> Add your screenshots to `docs/screenshots/` and uncomment the lines below.

<!--
| Dashboard | Budgets |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Budgets](docs/screenshots/budgets.png) |

| Transactions | Landing page |
|---|---|
| ![Transactions](docs/screenshots/transactions.png) | ![Landing](docs/screenshots/landing.png) |
-->

## Try it in one click

No sign-up needed. Open the app and press **Try the demo account** to explore a dashboard filled with six months of sample data.

## Features

**Money tracking**
- Add, edit and delete transactions, each with a category, date and note
- Search by note, filter by type, category and date range, and paginate the results
- Export your transactions to CSV (the export respects your current filters)

**Budgets**
- Set a monthly limit for each expense category
- Progress bars change from green to amber to red as you approach the limit
- See how much is left, or how far over you are

**Dashboard**
- Net balance, income, expenses and savings rate for any month
- Change versus last month on income and expenses
- Income vs. expenses chart for the last 6 months
- Spending-by-category donut chart and recent activity

**Experience**
- Animated number counters, springy modal and progress bars
- Custom animated sidebar and floating navigation
- Fully responsive, with a bottom tab bar on mobile

**Accounts and security**
- Sign up and log in with JWT sessions and bcrypt-hashed passwords
- Every query is scoped to the logged-in user, so nobody can see anyone else's data

## Tech stack

| Layer | Tech | Why it's here |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast dev server, and TypeScript catches mistakes in money and date handling |
| Styling | Tailwind CSS v4 | Quick, consistent styling for cards, tables and forms |
| State | Zustand | Tiny store, used for the persisted login session |
| Routing | React Router | Public pages and protected app pages in one router |
| HTTP | Axios | An interceptor adds the token and signs the user out on a 401 |
| Charts | Recharts | Simple chart components that plug straight into React |
| Animation | React Spring + Motion | Physics-based counters, modal and progress bars, plus layout and scroll animation |
| Backend | FastAPI | Python, automatic validation with Pydantic, and free API docs at `/docs` |
| Database | SQLAlchemy + PostgreSQL | Dashboard numbers are `GROUP BY` / `SUM` queries, which Postgres handles well |
| Local dev | SQLite fallback | Run the whole project with zero database setup |

## How it works

```
React app (Vite)  ──Axios + JWT──▶  FastAPI  ──SQLAlchemy──▶  PostgreSQL (SQLite locally)
```

Frontend routes: `/` (landing), `/login`, `/about`, and the protected `/dashboard`, `/transactions`, `/budgets`, `/account`.

### Engineering decisions worth knowing about

1. **Data isolation.** Every query filters by `user_id`, and category ownership is re-checked on every write, so one user can't attach a transaction to another user's category.
2. **The server decides the type.** A transaction's `income` or `expense` type is copied from its category on the server and never trusted from the client.
3. **Aggregation in SQL.** Totals, per-category sums and the 6-month chart use `GROUP BY` + `SUM` in the database. Empty months are filled with zeros so the chart has no gaps.
4. **Date-range correctness.** Month queries use `date >= first_of_month AND date < first_of_next_month` (end exclusive), so no day is missed or counted twice.
5. **Debounced search.** The search box waits 350 ms after typing stops, so the API isn't called on every keystroke.

## API overview

Interactive docs are served at `/docs` when the backend is running.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` · `/login` · `/demo` | Create an account, log in, or open the demo account |
| GET | `/api/auth/me` | Current user |
| GET / POST / DELETE | `/api/categories` | Manage categories |
| GET / POST / PUT / DELETE | `/api/transactions` | CRUD with filters and pagination |
| GET | `/api/transactions/export` | CSV download |
| GET | `/api/budgets?month=YYYY-MM` | Budgets with the amount spent |
| PUT / DELETE | `/api/budgets/{category_id}` | Set (upsert) or remove a budget |
| GET | `/api/analytics/summary` · `/by-category` · `/monthly` | Dashboard data |

## Project structure

```
CashWell/
├── backend/app/
│   ├── main.py          # app, CORS, routers
│   ├── database.py      # engine and session (SQLite or Postgres)
│   ├── models.py        # users, categories, transactions, budgets
│   ├── schemas.py       # request/response validation
│   ├── security.py      # bcrypt, JWT, get_current_user
│   ├── seed.py          # default categories and demo data
│   └── routers/         # auth, categories, transactions, budgets, analytics
└── frontend/src/
    ├── api/             # axios client and endpoint functions
    ├── store/           # zustand auth store
    ├── pages/           # Landing, Login, About, Dashboard, Transactions, Budgets, Account
    ├── components/      # Layout, PublicLayout, TransactionModal, AnimatedNumber, LineIcon...
    ├── hooks/           # useCategories
    └── lib/             # currency and date formatting
```

## Run it locally

Short version: start the backend (`uvicorn app.main:app --reload`) and the frontend (`npm run dev`), then open http://localhost:5173.

The full step-by-step guide, environment variables, deployment notes and troubleshooting are in **[SETUP.md](SETUP.md)**.

## Roadmap

- [ ] Custom category management screen
- [ ] Recurring transactions (rent, subscriptions)
- [ ] Automated tests (Pytest for the API, Playwright end to end)
- [ ] Docker Compose (API + Postgres) and a CI workflow
- [ ] Dark mode, multiple currencies, receipt uploads
