# QuikFix

QuikFix is a capstone-ready web app that teaches beginners how to debug Python and Java code through a light game experience. Learners clear bug-themed obstacles, request AI tutoring hints, and unlock the next level after fixing each challenge.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Flask
- AI hints: OpenAI Responses API
- Progress: browser localStorage

## Quick start

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Environment variables

Create `backend/.env` from `backend/.env.example`.

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.2
```

If the API key is missing, the app still works and falls back to built-in hints so the demo never breaks.
