# Todo App (React + FastAPI + SQLite)

## Frontend

- React + Vite + TypeScript
- Dev: `cd frontend && npm install && npm run dev`
- Config: create `frontend/.env`

```
VITE_API_BASE=http://127.0.0.1:8000
```

## Backend

- FastAPI + SQLAlchemy + SQLite
- Dev: `cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload`
- DB file: `backend/todos.db`

## API

- GET `/health`
- GET `/todos`
- POST `/todos` { title, description?, is_completed? }
- PUT `/todos/{id}` { title?, description?, is_completed? }
- DELETE `/todos/{id}`

## Project Setup

```
/ frontend
/ backend
```

## License

MIT
