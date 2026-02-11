# React Frontend

This UI connects to your FastAPI app.

## Run backend
From project root:

```bash
uvicorn main:app --reload --port 8002
```

## Run frontend
In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open: `http://127.0.0.1:5173`

## Features
- Show all patients from `/sort`
- Sort by `height`, `weight`, or `bmi`
- Sort order `asc` or `desc`
- Search single patient by ID from `/patient/{patient_id}`

## Optional env
You can change backend URL with:

```bash
VITE_API_BASE=http://127.0.0.1:8002
```
