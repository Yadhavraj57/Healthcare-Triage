# TriageAI — Healthcare Triage Agent

AI-powered healthcare triage system. Patients describe symptoms in natural language; four CrewAI agents analyze them and return a triage report with urgency level, conditions, specialist recommendation, and appointment booking.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand, Axios |
| Backend | FastAPI, CrewAI (4-agent), OpenAI GPT-4o |
| Database | PostgreSQL (Railway), SQLAlchemy + Alembic |
| Auth | JWT (python-jose + passlib) |
| Deploy | Railway (backend) + Vercel (frontend) |

---

## Project Structure

```
healthcare-triage-agent/
├── backend/
│   ├── agents/          # 4 CrewAI agents + triage_crew orchestrator
│   ├── routers/         # FastAPI routes: triage, auth, appointments
│   ├── models/          # SQLAlchemy models
│   ├── alembic/         # DB migrations
│   ├── main.py          # FastAPI app entry
│   └── database.py      # SQLAlchemy setup
└── frontend/
    ├── app/             # Next.js pages: /, /triage, /results, /booking, /auth
    ├── components/      # SymptomForm, ResultCard, SpecialistCard, AppointmentModal
    └── lib/             # api.ts (Axios), store.ts (Zustand)
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in env vars
cp .env .env.local
# Set OPENAI_API_KEY, DATABASE_URL, JWT_SECRET

# Run migrations
alembic upgrade head

# Start dev server
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/docs for interactive API docs.

### Frontend

```bash
cd frontend
npm install

# Set API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Visit http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)

```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@host:5432/healthcare_triage
JWT_SECRET=your_random_secret_here
JWT_ALGORITHM=HS256
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

---

## Deployment

### Backend → Railway

1. Push `backend/` to a GitHub repo
2. Create Railway project → Deploy from GitHub
3. Add **PostgreSQL** plugin in Railway dashboard
4. Set all environment variables in Railway → Variables
5. Railway auto-reads `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Run migrations: add a start command or use Railway's post-deploy hook:
   ```
   alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import project in Vercel dashboard
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Update `vercel.json` with the Railway URL
5. Deploy — Vercel auto-detects Next.js

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/triage` | Run 4-agent triage crew |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/appointments` | List user appointments |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/history` | Past triage sessions |
| GET | `/api/health` | Health check |

---

## Disclaimer

This tool is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional. In case of emergency, call your local emergency number immediately.
