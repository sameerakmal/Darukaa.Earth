# Darukaa.Earth

> Full-stack geospatial data analytics platform for managing and visualizing carbon and biodiversity projects.

---

## Overview

**Darukaa.Earth** is designed to provide administrators and analysts with geospatial tools to monitor, manage, and visualize environmental, carbon, and biodiversity projects. The platform combines interactive satellite mapping, spatial analysis, project site tracking, and performance analytics.

This repository is organized as a full-stack monorepo featuring a React (TypeScript + Vite) frontend and a Python (FastAPI + SQLAlchemy + PostGIS) backend.

---

## Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Code Quality**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- **ORM & Database**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) + [GeoAlchemy2](https://geoalchemy2.readthedocs.io/)
- **Database**: [PostgreSQL 15](https://www.postgresql.org/) with [PostGIS 3.3](https://postgis.net/) extension

### DevOps & Infrastructure
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Version Control**: Git

---

## Project Structure

```text
darukaa-earth/
├── docs/
│   └── Darukaa___FullStack_Hackathon_(1)_revised_613627.pdf
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.cjs
│   └── .prettierrc
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── health.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── session.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   │   └── test_health.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── .github/
│   └── workflows/
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quick Start / Local Setup

### 1. Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (v18 or higher) & `npm`
- [Python](https://www.python.org/) (v3.10 or higher)

---

### 2. Start PostgreSQL + PostGIS Database
Spin up the PostGIS database container in detached mode:

```bash
docker compose up -d db
```

To check container health:
```bash
docker compose ps
```

---

### 3. Start the Backend API

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Verify backend status:
   - Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Endpoint: [http://localhost:8000/health](http://localhost:8000/health)

---

### 4. Start the Frontend App

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Code Quality & Testing

### Backend Tests
From the `backend` directory:
```bash
pytest
```

### Frontend Linting & Formatting
From the `frontend` directory:
```bash
npm run lint
npm run prettier:check
```
