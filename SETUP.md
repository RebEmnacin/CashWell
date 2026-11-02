# CashWell: Setup and Comeback Guide

This is the "I'm coming back to this project after a while" file. The public overview is in [README.md](README.md).

## 1. Requirements

| Tool | Version | Why |
|---|---|---|
| Python | 3.10 or newer | FastAPI backend |
| Node.js | **20.19+ or 22.12+** | Vite 8 refuses to run on older Node (the old README said 18, which is too old) |
| Git | any | Clone the repo |

Check what you have:

```bash
python --version
node --version
```

## 2. First-time setup

### Backend (terminal 1)

```bash
cd backend
python -m venv venv
```

Activate the virtual environment (**this step is required**, otherwise packages install globally):

```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Windows (cmd)
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate
```

Then install and start:

```bash
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health
- A `finance.db` file appears on first start (SQLite). Tables are created automatically.

### Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and click **Try the demo account**.

In dev, Vite forwards every `/api` request to `localhost:8000`, so you don't need to set `VITE_API_URL`.

## 3. Every time after that

```bash
# terminal 1
cd backend
source venv/bin/activate          # Windows: venv\Scripts\activate
uvicorn app.main:app --reload

# terminal 2
cd frontend
npm run dev
```

## 4. Environment variables

### `backend/.env`

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./finance.db` | Default. Use a Postgres URL for production |
| `SECRET_KEY` | long random string | **Change this in production.** If it's missing, the code falls back to a public dev key |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of frontend URLs allowed to call the API |

Generate a strong secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### `frontend/.env`

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.example.com/api` | Only needed when the API is on a different URL (production). Leave unset locally |

## 5. Switching to Postgres (e.g. Neon)

In `backend/.env`:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Restart the backend. No code changes needed. `database.py` already handles these for you:

- a pasted `psql 'postgresql://...'` string (the `psql` and quotes are stripped)
- `postgres://` is rewritten to `postgresql://`
- the driver is switched to `postgresql+psycopg://` (psycopg 3)

## 6. Deploying

**Frontend (Vercel or Netlify)**
- Root directory: `frontend`
- Build command: `npm run build`, output directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend>/api`
- All paths must rewrite to `/index.html` for React Router. `frontend/vercel.json` already does this. On Netlify, add a `_redirects` file containing `/* /index.html 200`.

**Backend (Render, Railway, Fly.io)**
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` (set this to your deployed frontend URL, no trailing slash)

## 7. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `Cannot reach the server. Is the backend running?` | Backend isn't running, or `VITE_API_URL` points to the wrong place |
| Browser console shows a CORS error | Add the exact frontend URL to `CORS_ORIGINS` in `backend/.env` and restart the backend |
| `ModuleNotFoundError` when starting the backend | The virtual environment isn't activated, or `pip install -r requirements.txt` wasn't run in it |
| PowerShell says scripts are disabled | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use the `cmd` activate line |
| Vite says the Node version is unsupported | Upgrade Node to 20.19+ or 22.12+ |
| Port 8000 or 5173 already in use | Stop the other process, or change the port (`--port 8001` for uvicorn, `server.port` in `vite.config.ts`) |
| Login works but you get logged out immediately | The backend returned a 401, so check `SECRET_KEY` didn't change between restarts |
| Page refresh gives a 404 in production | The host is missing the "rewrite all paths to `/index.html`" rule |
| Demo charts look empty or old | The demo data is seeded once, relative to the day it was created. Delete the demo user (or `finance.db`) and open the demo again |
| You want a clean local database | Stop the backend and delete `backend/finance.db`. It's recreated on next start |

## 8. Where things live

| I want to change... | Go to |
|---|---|
| Currency or locale | `frontend/src/lib/format.ts` (`CURRENCY`, `LOCALE`) |
| Brand colors, radius, shared button/input styles | `frontend/src/index.css` |
| Landing page text and slides | top of `frontend/src/pages/Landing.tsx` |
| About page text and stack list | top of `frontend/src/pages/About.tsx` |
| Default categories and demo data | `backend/app/seed.py` |
| Token lifetime (7 days) | `TOKEN_HOURS` in `backend/app/security.py` |
| Sidebar animation | `frontend/src/components/Layout.tsx` |
| API paths used by the frontend | `frontend/src/api/endpoints.ts` |

## 9. Known issues and loose ends

- [ ] The demo account is shared by everyone, seeded once, and its password is public in `auth.py`
- [ ] "Net balance" on the dashboard is the selected month's income minus expenses, not a running total
- [ ] Budgets use one limit for every month (they aren't per month)
- [ ] Leftover old names: Zustand key `ledgerly-auth`, API title "Finance Tracker API", demo email `@financetracker.dev`, package name `finance-tracker-frontend`
- [ ] `SECRET_KEY` silently falls back to a dev key if the env var is missing
- [ ] Tables are created with `create_all` on startup, with no migrations (consider Alembic)
- [ ] Categories have a backend API but no UI
- [ ] `index.html` favicon uses `type="image/png+xml"`, which should be `image/png`
- [ ] Search doesn't escape `%` and `_` in the `ilike` filter
- [ ] The JWT is stored in localStorage (XSS exposure), with no refresh token
- [ ] Animations ignore the OS "reduce motion" setting (`reducedMotion="never"`, `RESPECT_REDUCED_MOTION = false`)
- [ ] No automated tests

## 10. Learn-later checklist

Things to study when you review the code line by line:

- [ ] How `Depends(get_db)` and `Depends(get_current_user)` work in FastAPI
- [ ] How a JWT is created and verified (`security.py`)
- [ ] SQLAlchemy `group_by`, `func.sum`, `joinedload` (`routers/analytics.py`, `transactions.py`)
- [ ] How the Axios interceptor adds the token (`api/client.ts`)
- [ ] Zustand `persist` middleware (`store/authStore.ts`)
- [ ] The `useEffect` + `useCallback` data loading pattern (`pages/Dashboard.tsx`)
- [ ] `useSpring` / `useTransition` from React Spring
- [ ] Motion's shared `layoutId` (the sliding sidebar pocket in `Layout.tsx`)

## 11. Ideas for later

- Recurring transactions (rent, subscriptions)
- Custom category management screen
- Pytest tests for the API, and a Playwright end-to-end test
- Docker Compose (API + Postgres) and a GitHub Actions CI workflow
- Dark mode, multiple currencies, receipt image upload
