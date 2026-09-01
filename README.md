# Life Finance Assistant — MVP

A lean, working slice of the full "Life Finance Assistant" concept: one platform (responsive web),
four core modules — **Dashboard, Credit Cards, EMIs & Loans, Reminders** — built on a real FastAPI +
React stack so it can grow into the fuller spec later without a rewrite.

## What's actually implemented (and tested)

- **Auth**: email/password registration & login, JWT-based sessions (Google/Apple/Microsoft login,
  biometrics are on the roadmap — see below)
- **Credit Cards**: CRUD, per-card utilization %, available limit, color coding, due-date tracking
- **EMIs & Loans**: CRUD, monthly commitment total, tenure/progress tracking
- **Reminders**: CRUD, categories, recurring flag, due/overdue/completed states
- **Dashboard**: aggregated summary — total credit available, overall utilization, monthly
  commitments, missed/today/next-7-days reminder buckets, over-30%/over-70% utilization warnings

Backend logic was smoke-tested end to end (register → create card/EMI/reminder → dashboard summary)
via FastAPI's TestClient. Frontend type-checks and builds cleanly (`tsc -b && vite build`).

## What's intentionally NOT built yet

This is the scoped-down MVP, not the full spec. Left out for now, in rough priority order for a v2:
- Push/email/SMS/WhatsApp notifications and the "escalation every 6 hours" reminder engine
- Social login (Google/Apple/Microsoft) and biometric login
- Bank accounts module, goal tracker, recurring bills module, documents/expiry tracker
- Calendar sync (Google/Outlook/Apple), Celery background jobs, Redis
- AI assistant chat, predictive insights
- Mobile apps (React Native/Flutter), PDF/Excel reports, OCR/statement parsing, bank API integrations
- Automated test suite (pytest) and CI/CD

## Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite by default (swap `DATABASE_URL` for Postgres), JWT auth
- **Frontend**: React + TypeScript + Vite, Tailwind CSS v4, React Router

## Running it locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs at `http://localhost:8000/docs`. Set `SECRET_KEY` and `DATABASE_URL` env vars for anything
beyond local dev.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Opens on `http://localhost:5173`, proxying `/api` to the backend on port 8000 (see `vite.config.ts`).

## Data model

- `User` — email, hashed password, name
- `CreditCard` — bank, name, limit, used amount, statement/due day, interest, rewards, color
- `EMI` — loan name, bank, amount, due day, principal, tenure/remaining months
- `Reminder` — title, category, due date, amount, recurring flag, completion state, optional links
  to a credit card or EMI

## Suggested next steps

1. Add a Postgres deployment target (Railway/Fly.io) and point `DATABASE_URL` at it
2. Add the reminder engine as a Celery beat job (daily scan → push/email via FCM/SMTP)
3. Add Google login (start with just Google, not all three providers) via OAuth2
4. Add the Bank Accounts module — it unlocks the "will this EMI bounce" cash-shortage warning
5. Wrap the web app with Capacitor or Expo for a first mobile build once the web app is solid
