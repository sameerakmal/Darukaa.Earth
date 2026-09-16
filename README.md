# Darukaa.Earth

> Full-stack geospatial data analytics platform for managing, visualizing, and monitoring carbon and biodiversity projects.

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Database Schema & Architecture](#database-schema--architecture)
- [Project Structure](#project-structure)
- [Quick Start / Local Setup](#quick-start--local-setup)
- [Environment Variables](#environment-variables)
- [Mapbox Access Token](#mapbox-access-token)
- [Testing & Verification](#testing--verification)
- [CI/CD Pipeline & GitHub Actions](#cicd-pipeline--github-actions)
- [Code Quality & Pre-Commit Hooks (Husky)](#code-quality--pre-commit-hooks-husky)
- [Live Demo](#live-demo)
- [Submission & Repository Access](#submission--repository-access)

---

## Overview

**Darukaa.Earth** is a modern geospatial data analytics platform engineered for environmental project administrators and ecological analysts. It enables seamless monitoring, management, and visualization of carbon sequestration sites and biodiversity conservation projects across interactive satellite maps, spatial polygon geometries, and time-series performance charts.

---

## Key Features

- **JWT Authentication & Security**: Complete user registration and login workflow with password hashing (Bcrypt) and stateless JWT token authentication.
- **Project Management Dashboard**: Create, view, filter, and isolate carbon and biodiversity projects with metadata tags and project status tracking.
- **Geospatial Map Canvas (Mapbox GL JS + Draw)**: Interactive satellite mapping with custom polygon drawing controls (`@mapbox/mapbox-gl-draw`), site selection, automatic bounding-box fitting, and vertex calculations.
- **Data Visualization & Performance Analytics (Highcharts)**: Interactive dual-axis trend analysis visualizing carbon sequestration (tCO₂e) and biodiversity health scores (0-100 index) over time.
- **Robust Geospatial Database (PostGIS)**: Spatial polygon storage using PostGIS geometries (`SRID 4326`), with cross-database fallback for offline dev/test environments.
- **Automated Code Quality & CI/CD**: Pre-commit hooks via Husky + lint-staged, automated ESLint checks, Prettier formatting, and GitHub Actions workflow testing on every push/PR.

---

## High-Level Architecture

```text
               +-------------------------------------------------------+
               |                  React 18 Frontend                    |
               |       TypeScript + Vite + Tailwind CSS + Lucide       |
               +---------------------------+---------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
        +----------v----------+                         +----------v----------+
        |   Mapbox GL JS &    |                         |  Highcharts React   |
        |  Mapbox GL Draw     |                         | Time-Series Charts  |
        +---------------------+                         +---------------------+
                                           |
                                  REST API (JSON/JWT)
                                           |
               +---------------------------v---------------------------+
               |                  FastAPI Backend                      |
               |     Python 3.12 + Pydantic v2 + OAuth2 JWT Auth       |
               +---------------------------+---------------------------+
                                           |
               +---------------------------v---------------------------+
               |           SQLAlchemy 2.0 + GeoAlchemy2                |
               +---------------------------+---------------------------+
                                           |
               +---------------------------v---------------------------+
               |          PostgreSQL 15 + PostGIS 3.3                  |
               |        (Spatial Polygons SRID 4326 + Cascade FKs)     |
               +-------------------------------------------------------+
```

---

## Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) with [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Mapping**: [Mapbox GL JS v3](https://docs.mapbox.com/mapbox-gl-js/) + [`@mapbox/mapbox-gl-draw`](https://github.com/mapbox/mapbox-gl-draw)
- **Data Visualization**: [Highcharts](https://www.highcharts.com/) + [`highcharts-react-official`](https://github.com/highcharts/highcharts-react)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + Lucide Icons
- **Routing**: React Router DOM v6
- **Code Quality**: ESLint + Prettier

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12)
- **ORM & Spatial Extension**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) + [GeoAlchemy2](https://geoalchemy2.readthedocs.io/)
- **Database**: [PostgreSQL 15](https://www.postgresql.org/) with [PostGIS 3.3](https://postgis.net/)
- **Geometry Processing**: [Shapely](https://shapely.readthedocs.io/) (GeoJSON validation, WKT/WKB parsing)
- **Authentication**: Passlib (Bcrypt) + PyJWT + FastAPI OAuth2 Bearer

### DevOps & Developer Experience
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)
- **Pre-commit Hooks**: Husky v8 + lint-staged
- **Containerization**: Docker & Docker Compose (`postgis/postgis:15-3.3`)

---

## Database Schema & Architecture

The database is built on PostgreSQL with PostGIS extensions:

```text
  +------------------+         +--------------------+
  |      USERS       |         |      PROJECTS      |
  +------------------+         +--------------------+
  | id (UUID, PK)    |<-------1| id (UUID, PK)      |
  | email (String)   |        *| user_id (UUID, FK) |
  | password_hash    |         | name (String)      |
  | created_at       |         | project_type       |
  +------------------+         | status             |
                               | created_at/updated |
                               +---------+----------+
                                         |1
                                         |
                                         |*
                               +---------v----------+
                               |       SITES        |
                               +--------------------+
                               | id (UUID, PK)      |
                               | project_id (FK)    |
                               | name (String)      |
                               | description (Text) |
                               | area (Float, ha)   |
                               | geometry (POLYGON) |
                               |   SRID 4326        |
                               | created_at/updated |
                               +---------+----------+
                                         |1
                                         |
                                         |*
                               +---------v----------+
                               |   SITE_ANALYTICS   |
                               +--------------------+
                               | id (UUID, PK)      |
                               | site_id (UUID, FK) |
                               | date (Date)        |
                               | carbon_value       |
                               | biodiversity_score |
                               +--------------------+
```

- **Cascading Deletes**: Deleting a User cascades to their Projects -> Sites -> SiteAnalytics.
- **PostGIS SRID 4326**: Site geometries are stored in spatial WGS 84 (`SRID 4326`) polygon format.
- **UUID Primary Keys**: All tables use UUID primary keys for global uniqueness and security.

---

## Project Structure

```text
darukaa-earth/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD Pipeline
├── .husky/
│   └── pre-commit                 # Git pre-commit code quality hook
├── docs/
│   └── Darukaa___FullStack_Hackathon_(1)_revised_613627.pdf
├── frontend/
│   ├── src/
│   │   ├── api/                   # API HTTP client modules
│   │   │   ├── analytics.ts       # GET/POST /sites/{id}/analytics
│   │   │   ├── auth.ts            # POST /auth/login, /auth/register, GET /auth/me
│   │   │   ├── client.ts          # Base fetch wrapper (JWT injection, 401 handling)
│   │   │   ├── projects.ts        # CRUD /projects
│   │   │   └── sites.ts           # CRUD /projects/{id}/sites, /sites/{id}
│   │   ├── components/
│   │   │   ├── Layout/            # Navbar, ProtectedRoute, PublicRoute
│   │   │   ├── Map/               # ProjectMap (Mapbox GL JS + Draw)
│   │   │   ├── Projects/          # CreateProjectModal, ProjectCard
│   │   │   └── Sites/             # CreateSiteModal, SiteAnalyticsModal
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # JWT auth state (login, register, logout)
│   │   ├── pages/                 # Route pages (Dashboard, ProjectDetails, Login, Register)
│   │   ├── types/                 # TypeScript type interfaces
│   │   ├── App.tsx                # Router + route guards
│   │   └── main.tsx
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/                   # FastAPI route handlers (auth, projects, sites, analytics)
│   │   ├── core/                  # Security & configuration
│   │   ├── database/              # DB sessions, engine & init_db
│   │   ├── models/                # SQLAlchemy models (User, Project, Site, Analytics)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # Business logic & geometry handling
│   │   └── main.py
│   ├── tests/                     # Comprehensive Pytest test suite (10 tests)
│   ├── requirements.txt
│   └── .env.example
├── docker-compose.yml             # PostGIS service definition
├── package.json                   # Monorepo root (Husky + lint-staged)
└── README.md
```

---

## Quick Start / Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher) & `npm`
- **Python** (v3.10 or higher)
- **Docker & Docker Compose** (for PostgreSQL + PostGIS)

---

### 2. Database Setup (Docker PostGIS)

Spin up the PostGIS container:

```bash
docker compose up -d db
```

Verify database health:
```bash
docker compose ps
```

---

### 3. Backend Setup & Server Execution

1. Navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create virtual environment & install dependencies:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate

   pip install -r requirements.txt
   ```

3. Configure backend environment (copy from template):
   ```bash
   cp .env.example .env
   # Edit .env if your PostgreSQL credentials differ from defaults
   ```

4. Run the FastAPI dev server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Access backend documentation:
   - Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Status: [http://localhost:8000/health](http://localhost:8000/health)

---

### 4. Frontend Setup & Application Launch

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment (see [Environment Variables](#environment-variables) below):
   ```bash
   cp .env.example .env
   # Add your Mapbox public token to VITE_MAPBOX_TOKEN
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_SERVER` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `darukaa` | Database username |
| `POSTGRES_PASSWORD` | `darukaa_secret` | Database password |
| `POSTGRES_DB` | `darukaa_earth` | Database name |
| `SECRET_KEY` | *(set a strong random value in production)* | JWT signing secret |
| `DATABASE_URL` | *(optional)* | Full DSN override (overrides individual Postgres vars) |

> **Security note**: Never commit a production `SECRET_KEY` to version control. Generate one with:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g. `http://localhost:8000`) |
| `VITE_MAPBOX_TOKEN` | Yes | Your Mapbox public access token (see below) |

> The `frontend/.env` file is **git-ignored** and must be created locally. Use `frontend/.env.example` as a template.

---

## Mapbox Access Token

Interactive satellite maps and polygon drawing require a **Mapbox public access token**.

1. Create a free account at [https://account.mapbox.com/](https://account.mapbox.com/)
2. Navigate to **Tokens** and copy your default public token (starts with `pk.`)
3. Add it to your `frontend/.env`:
   ```env
   VITE_MAPBOX_TOKEN=pk.eyJ1Ijoixxxxxx...
   ```

The token is read at runtime via `import.meta.env.VITE_MAPBOX_TOKEN`. No token is hardcoded in source code. If the variable is missing or left as the placeholder value, the map component renders a clear setup-instructions panel rather than failing silently.

---

## Testing & Verification

### Backend

```bash
cd backend
pytest                    # Run all 10 tests
pytest -v                 # Verbose output with test names
pytest tests/test_auth.py # Run a specific test module
```

Tests cover: JWT authentication, project CRUD, site creation with GeoJSON polygons, analytics records, and database model integrity. The test suite uses an in-memory SQLite fallback so no live PostgreSQL instance is required for local testing.

### Frontend

```bash
cd frontend
npm run lint              # ESLint — 0 warnings tolerance
npm run prettier:check    # Prettier formatting check
npm run build             # TypeScript compile + Vite production bundle
```

### Monorepo (from root)

```bash
npm run lint              # Delegates to frontend ESLint
npm run prettier:check    # Delegates to frontend Prettier check
npm run test:backend      # Runs pytest from root
npm run test:frontend     # Runs frontend production build
```

---

## CI/CD Pipeline & GitHub Actions

The repository includes an automated GitHub Actions pipeline (`.github/workflows/ci.yml`) configured to run on all pushes and pull requests to `main`/`master`:

- **Backend Automation Job**:
  - Provisions a live PostgreSQL + PostGIS 15-3.3 service container in GitHub Actions.
  - Installs Python 3.12 dependencies.
  - Runs the full `pytest` suite verifying JWT auth, project CRUD, GeoJSON polygon handling, and site analytics.
- **Frontend Automation Job**:
  - Installs Node.js 20 dependencies via `npm ci`.
  - Executes Prettier syntax checks (`npm run prettier:check`).
  - Runs strict ESLint code quality inspection (`npm run lint`).
  - Compiles the full TypeScript production bundle (`npm run build`).
- **Deployment Trigger Job**: Runs only on `main`/`master` after both jobs pass. No external deployment secrets are required.

---

## Code Quality & Pre-Commit Hooks (Husky)

This repository enforces automated pre-commit code quality validation using **Husky** and **lint-staged**.

### Setup Husky Pre-Commit Hooks
From the monorepo root directory:
```bash
npm install
npx husky install
```

When creating git commits, Husky automatically runs `lint-staged` to format TypeScript, JSON, and CSS files via Prettier before the commit is recorded. This ensures all committed frontend source code is consistently formatted.

**lint-staged scope** — only `frontend/src/**/*.{ts,tsx,css,json}` files are processed; backend, config files, and root-level files are not affected.

---

## Live Demo

> 🚧 **Live deployment URL**: *(to be added upon deployment)*
>
> Repository URL: *(to be added — access granted to submission reviewers below)*

---

## Submission & Repository Access

In accordance with submission guidelines, access to this GitHub repository is granted to the hiring team accounts:

- `ankita.dasgupta@darukaa.com`
- `harsh.kumar@darukaa.com`
- `utkarsh.gauniyal@darukaa.com`
- `guneet.mutreja@darukaa.com`
