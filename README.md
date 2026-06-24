# Study Hub

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009485?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DD0031?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  A collaborative study platform for students — shared notes, task boards, real-time chat, flashcards, and exam countdowns.
</p>

---

## What is Study Hub?

Study Hub brings together the best parts of Discord, Trello, and Google Docs into one focused tool for study groups. Students can create or join groups, collaborate on shared notes, manage tasks on a Kanban board, chat in real time, and revise using spaced-repetition flashcards.

Built as a full-stack portfolio project by [Tyler Bravin](https://github.com/tyler-bravin) and [Alistair MacDiarmid](https://github.com/AlistairMacDiarmid).

---

## Features

| Feature | Status |
|---|---|
| User accounts & JWT auth | ✅ Complete |
| Frontend auth — login, register, dashboard | ✅ Complete |
| Refresh token with rotation | ✅ Complete |
| Study groups (create, join via invite code, roles) | 🔧 In progress |
| Real-time group chat (WebSockets) | 🔧 In progress |
| Shared rich-text notes | 📋 Planned |
| Task board (Kanban) | 📋 Planned |
| Flashcards with spaced repetition (SM-2) | 📋 Planned |
| Exam countdowns | 📋 Planned |
| File uploads | 📋 Planned |

---

## Tech Stack

### Frontend

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-FF6B00?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white" />
</p>

- React 19 + TypeScript + Vite 8
- Zustand (state management)
- Axios (HTTP client with JWT interceptor and silent refresh)
- React Router v7
- Custom CSS design system — light/dark theme, glass cards, animated aura orbs

### Backend

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009485?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DD0031?style=flat-square&logo=redis&logoColor=white" />
</p>

- FastAPI (Python) + SQLAlchemy + Alembic migrations
- PostgreSQL (primary database)
- Redis (WebSocket pub/sub for multi-process fan-out)
- Cloudflare R2 / S3-compatible object storage (file uploads)

### Auth

- JWT — access tokens (15 min) + refresh tokens (7 days) with rotation
- `python-jose` + `bcrypt` (direct, not passlib)
- Refresh token stored in httpOnly cookie

### Deployment

<p>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white" />
</p>

- Docker + Docker Compose (local dev — Postgres + Redis)
- [Railway](https://railway.app/) (production — backend, frontend, Postgres, Redis)

---

## Project Structure

```
studyhub/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point + CORS
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── dependencies.py      # get_current_user JWT dependency
│   │   ├── security.py          # bcrypt hashing, JWT create/decode
│   │   ├── models/
│   │   │   └── user.py          # User model
│   │   ├── schemas/
│   │   │   └── auth.py          # Pydantic request/response schemas
│   │   └── routers/
│   │       └── auth.py          # /register, /login, /me, /refresh
│   ├── alembic/                 # Database migrations
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts         # Axios instance + JWT interceptor
│   │   ├── store/
│   │   │   └── authStore.ts     # Zustand auth store
│   │   ├── context/
│   │   │   └── ThemeContext.tsx # Light/dark theme provider
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── App.tsx              # Router setup
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (for local Postgres + Redis)

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env — fill in JWT_SECRET, JWT_REFRESH_SECRET and check DATABASE_URL

# Start Postgres and Redis (from project root)
docker compose up -d postgres redis

# Run migrations
alembic upgrade head

# Start the dev server
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Swagger UI at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# VITE_API_URL and VITE_WS_URL are pre-filled for local dev

# Start the dev server
npm run dev
```

Frontend available at `http://localhost:5173`

---

## Environment Variables

### backend/.env

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime (default: 15) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime (default: 7) |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_ENDPOINT_URL` | R2 S3-compatible endpoint URL |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. http://localhost:5173) |

### frontend/.env

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL |
| `VITE_WS_URL` | Backend WebSocket base URL |

---

## API Reference

Full interactive API docs available at `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc`.

Health check: `GET /api/v1/health`

---

## Development Workflow

```
main   ← stable, deployable (never push here directly)
dev    ← day-to-day development
```

**Commit conventions:**

```
feat: add WebSocket connection manager
fix: correct JWT expiry calculation
chore: update dependencies
docs: update README
```

**Feature ownership:**

| Tyler | Ali |
|---|---|
| Frontend auth (login, register, dashboard) | Backend auth (JWT, register, login, refresh) |
| Real-time chat — backend + frontend | Study groups — backend + frontend |
| Flashcards + SM-2 algorithm | Task board (Kanban) |
| AI study sets — flashcards & quizzes from notes | Shared notes (rich text editor) |
| Exam countdowns | File uploads |

---

## License

This project is licensed under the MIT License — you're free to use, copy, modify and distribute this code. We just ask that you credit the original authors.

```
MIT License

Copyright (c) 2025 Tyler Bravin & Alistair MacDiarmid
```

See [LICENSE](./LICENSE) for the full licence text.

---

## Authors

- **Tyler Bravin** — [@tyler-bravin](https://github.com/tyler-bravin)
- **Alistair MacDiarmid** — [@AlistairMacDiarmid](https://github.com/AlistairMacDiarmid)

Built under the [ForthByte](https://github.com/ForthByte) organisation.
