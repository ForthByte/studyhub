# Study Hub

> A collaborative study platform for students — shared notes, task boards, real-time chat, flashcards, and exam countdowns. Built as a full-stack portfolio project.

---

## What is Study Hub?

Study Hub is a web application that brings together the best parts of Discord, Trello, and Google Docs into one focused tool for study groups. Students can create or join groups, collaborate on shared notes, manage tasks on a Kanban board, chat in real time, and revise using spaced-repetition flashcards.

---

## Features

| Feature | Status |
|---|---|
| User accounts & JWT auth | 🔧 In progress |
| Study groups (create, join via invite code) | 🔧 In progress |
| Real-time group chat (WebSockets) | 📋 Planned |
| Shared rich-text notes | 📋 Planned |
| Task board (Kanban) | 📋 Planned |
| Flashcards with spaced repetition (SM-2) | 📋 Planned |
| Exam countdowns | 📋 Planned |
| File uploads | 📋 Planned |

---

## Tech Stack

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (build tool)
- [Tailwind CSS v4](https://tailwindcss.com/)

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- [SQLAlchemy](https://www.sqlalchemy.org/) + [Alembic](https://alembic.sqlalchemy.org/) (ORM + migrations)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/) (WebSocket pub/sub)
- [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) (Cloudflare R2 file storage)

**Auth**
- JWT (access tokens 15 min · refresh tokens 7 days)
- `python-jose` + `passlib[bcrypt]`

**Deployment**
- Docker + Docker Compose (local dev)
- [Railway](https://railway.app/) (production)

---

## Project Structure

```
studyhub/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis (or Docker)

---

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
# Edit .env and fill in JWT_SECRET, JWT_REFRESH_SECRET, and DB credentials

# Run the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs (Swagger UI) at `http://localhost:8000/docs`.

---

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

The frontend will be available at `http://localhost:5173`.

---

### Environment Variables

**backend/.env**

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
| `FRONTEND_URL` | Frontend origin (for CORS) |

**frontend/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL |
| `VITE_WS_URL` | Backend WebSocket base URL |

---

## API

Once the backend is running, the full API reference is available at:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

Health check endpoint: `GET /api/v1/health`

---

## Development Workflow

Two branches — simple and right-sized for a two-person project.

```
main   ← stable, deployable (never push here directly)
dev    ← day-to-day development
```

Both push to `dev`. Merge `dev` → `main` when you have something stable — end of a feature, end of a sprint, or before a Railway deploy.

**Commit message convention:**

```
feat: add flashcard deck creation endpoint
fix: correct JWT expiry calculation
chore: update dependencies
docs: add setup instructions to README
```

**Feature ownership:**

| Tyler | Ali |
|---|---|
| Auth (JWT, register, login) | Study groups (create, join, roles) |
| Real-time chat (WebSockets) | Task board (Kanban) |
| Flashcards + SM-2 algorithm | Shared notes (rich text editor) |
| Exam countdowns | File uploads |

---

## Contributing

This is a private portfolio project — contributions are limited to the two authors. If you've been given access to review the code, please don't open unsolicited PRs.

---

## Authors

- **Tyler** — [@Tyler-Bravin](https://github.com/tyler-bravin)
- **Ali** — [@AlistairMacDiarmid](https://github.com/AlistairMacDiarmid)
