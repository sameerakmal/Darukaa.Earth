# Darukaa.Earth — Geospatial Intelligence & Climate Analytics Platform

> A production-grade, full-stack geospatial data analytics platform engineered for environmental administrators and ecological analysts to monitor carbon sequestration sites, draw interactive spatial boundaries, and analyze time-series biodiversity health metrics.

---

## Live Production Links

* **Frontend Dashboard (Vercel)**: [https://darukaa-earth.vercel.app](https://darukaa-earth.vercel.app)
* **Backend API (Render)**: [https://darukaa-api.onrender.com](https://darukaa-api.onrender.com)
* **Interactive API Documentation (Swagger)**: [https://darukaa-api.onrender.com/docs](https://darukaa-api.onrender.com/docs)
* **Backend Health Status**: [https://darukaa-api.onrender.com/health](https://darukaa-api.onrender.com/health)

---

## Features

* **User Authentication & Authorization**: Full user registration and login workflow utilizing Bcrypt password hashing and stateless JWT bearer tokens.
* **Project Management Dashboard**: Complete CRUD operations for carbon and biodiversity conservation projects with metadata filtering, status tags, and site association.
* **Interactive Mapbox Satellite Canvas**: Satellite mapping powered by Mapbox GL JS with dynamic bounding-box calculation, auto-zoom, and custom site markers.
* **Vector Polygon Spatial Drawing (`@mapbox/mapbox-gl-draw`)**: In-browser vector polygon creation tool enabling users to draw boundary shapes, calculate area in hectares, and persist GeoJSON geometries.
* **Time-Series Performance Analytics (Highcharts)**: Dual-axis visualization tracking carbon stock values ($tCO_2e$) and biodiversity index scores ($0-100$) over time.
* **Spatial Database Persistence (PostGIS)**: Native spatial polygon storage using PostGIS geometries (`SRID 4326`) with GeoJSON conversion via GeoAlchemy2 and Shapely.
* **Command Palette Navigation (`Ctrl+K` / `Cmd+K`)**: Keyboard-driven command palette for instant search and navigation across projects and sites.
* **Site Inspection Sheet**: Slide-out inspection drawer detailing site coordinates, spatial metadata, vertex counts, and historic performance logs.
* **Production Safety Controls**: Strict database connection checks preventing silent SQLite fallbacks in production deployment environments.

---

## Tech Stack

### Frontend
| Component | Technology |
| :--- | :--- |
| **Core Framework** | React 18 + TypeScript 5 |
| **Build Tooling** | Vite 5 |
| **Styling & UI** | Tailwind CSS v3 + Radix UI + Lucide Icons |
| **Geospatial Mapping** | Mapbox GL JS v3 + `@mapbox/mapbox-gl-draw` |
| **Analytics Charts** | Highcharts v13 + `highcharts-react-official` |
| **Routing** | React Router DOM v6 |

### Backend
| Component | Technology |
| :--- | :--- |
| **API Framework** | FastAPI 0.110 (Python 3.12) |
| **ORM & Spatial** | SQLAlchemy 2.0 + GeoAlchemy2 0.14 |
| **Geometry Utilities** | Shapely 2.0 (GeoJSON / WKT parsing) |
| **Validation** | Pydantic v2 + `email-validator` |
| **Authentication** | Passlib (Bcrypt) + PyJWT + OAuth2 Bearer |

### Database & Infrastructure
| Component | Technology |
| :--- | :--- |
| **Database** | Azure Database for PostgreSQL (Flexible Server) |
| **Spatial Engine** | PostGIS 3.6 (`SRID 4326`) |
| **Frontend Host** | Vercel (Edge SPA Hosting) |
| **Backend Host** | Render (Python 3.12 Web Service) |
| **CI/CD** | GitHub Actions + Docker Compose |

---

## System Architecture

```mermaid
graph TD
    subgraph Client Layer
        User(["User Browser"])
    end

    subgraph Hosting & Edge Layer
        Vercel["Vercel SPA Hosting<br/>(React 18 + Vite + Mapbox)"]
    end

    subgraph API Service Layer
        Render["Render Backend Web Service<br/>(FastAPI + Python 3.12)"]
    end

    subgraph Database Layer
        AzureDB[("Azure PostgreSQL + PostGIS<br/>(Flexible Server SRID 4326)")]
    end

    User -->|HTTPS| Vercel
    Vercel -->|HTTPS REST API / Bearer JWT| Render
    Render -->|PostgreSQL TCP + TLS/SSL| AzureDB
```

### Layer Responsibilities
* **Vercel Frontend**: Serves the compiled React single-page application, handling vector map rendering, interactive polygon drawing, and Highcharts analytics charts.
* **Render Backend**: Runs the stateless FastAPI application for user authentication, project/site management, GeoJSON validation, and JWT verification.
* **Azure PostgreSQL + PostGIS**: Managed spatial database storing user accounts, project structures, PostGIS geometry polygons, and analytics time-series metrics over encrypted TLS/SSL connections.

---

## Database & Spatial Model

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns"
    PROJECTS ||--o{ SITES : "contains"
    SITES ||--o{ SITE_ANALYTICS : "tracks"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        datetime created_at
    }
    PROJECTS {
        uuid id PK
        uuid user_id FK
        string name
        string project_type
        string status
        datetime created_at
        datetime updated_at
    }
    SITES {
        uuid id PK
        uuid project_id FK
        string name
        string description
        float area
        geometry geometry_SRID_4326
        datetime created_at
        datetime updated_at
    }
    SITE_ANALYTICS {
        uuid id PK
        uuid site_id FK
        date date
        float carbon_value
        float biodiversity_score
    }
```

### Spatial Data Processing
1. **Frontend**: Mapbox Draw captures vector polygon vertices as GeoJSON coordinates (`[longitude, latitude]`).
2. **API Layer**: FastAPI parses GeoJSON payloads, validates geometry using Shapely, and converts polygon coordinates into WGS 84 spatial shapes.
3. **Database Layer**: GeoAlchemy2 inserts spatial geometry records into PostgreSQL using PostGIS `GEOMETRY(POLYGON, 4326)` columns.
4. **Data Integrity**: All foreign keys feature `ON DELETE CASCADE` constraints ensuring clean cascading removal of dependent sites and analytics when a project or user is removed.

---

## Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB

    User->>Client: Enter Email & Password
    Client->>API: POST /api/v1/auth/login
    API->>DB: Fetch User Record by Email
    DB-->>API: Return Hashed Password
    API->>API: Verify Password via Bcrypt
    API-->>Client: Return Signed JWT Access Token
    Client->>Client: Store JWT in localStorage

    Note over Client,API: Subsequent Authenticated API Requests
    Client->>API: GET /api/v1/projects (Header: Bearer <token>)
    API->>API: Verify JWT Signature & Expiry
    API->>DB: Query Projects for User ID
    DB-->>API: Return User Projects
    API-->>Client: Return 200 OK JSON Response
```

---

## Local Development Setup

### Prerequisites
* **Node.js** (v18.0 or higher) & `npm`
* **Python** (v3.12 or higher)
* **Docker & Docker Compose** (Optional: for local PostGIS container)

---

### 1. Database Setup (Docker PostGIS)
To run PostgreSQL with PostGIS locally using Docker:

```bash
docker compose up -d db
```

---

### 2. Backend Setup & Local Server Execution

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate Python virtual environment
python -m venv .venv
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Create local environment file from template
cp .env.example .env

# 5. Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

Local API access points:
* **Swagger API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 3. Frontend Setup & Local Launch

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Create local environment file from template
cp .env.example .env

# 4. Add your Mapbox Public Token to frontend/.env:
# VITE_MAPBOX_TOKEN=pk.eyJ1Ijo...

# 5. Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Type | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `string` | Execution environment (`development` or `production`). Disables SQLite fallback when set to `production`. |
| `DATABASE_URL` | `string` | Full PostgreSQL DSN (e.g. `postgresql://user:pass@host:5432/dbname`). |
| `SECRET_KEY` | `string` | Cryptographic secret key used to sign JWT access tokens. |
| `CORS_ORIGINS` | `json` | Allowed CORS origins array (e.g. `["https://darukaa-earth.vercel.app"]`). |
| `POSTGRES_SERVER` | `string` | Fallback PostgreSQL host for local development (`localhost`). |
| `POSTGRES_PORT` | `string` | Fallback PostgreSQL port (`5432`). |
| `POSTGRES_USER` | `string` | Fallback PostgreSQL user (`darukaa`). |
| `POSTGRES_PASSWORD` | `string` | Fallback PostgreSQL password (`darukaa_secret`). |
| `POSTGRES_DB` | `string` | Fallback PostgreSQL database name (`darukaa_earth`). |

> **Security Note**: Never commit actual production secrets or database credentials to version control. `.env` files are excluded in `.gitignore`.

### Frontend (`frontend/.env`)

| Variable | Type | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `string` | Base URL of the backend API service (e.g. `https://darukaa-api.onrender.com` or `http://localhost:8000`). |
| `VITE_MAPBOX_TOKEN` | `string` | Mapbox GL public access key (`pk.eyJ1I...`). |

---

## Testing & Quality Assurance

### Backend Automated Test Suite (Pytest)
The backend test suite covers authentication flows, project CRUD, GeoJSON polygon parsing, PostGIS spatial queries, analytics series, and production database safety checks.

```bash
cd backend
pytest -v
```

### Frontend Code Quality & Bundle Verification

```bash
cd frontend

# Run ESLint code quality inspection (0 warnings tolerance)
npm run lint

# Verify code style and formatting using Prettier
npm run prettier:check

# Execute TypeScript compilation & production build bundle
npm run build
```

### Automated CI/CD (GitHub Actions)
The repository includes automated CI (`.github/workflows/ci.yml`) that triggers on all pushes and pull requests:
* **Backend Job**: Launches a live PostgreSQL + PostGIS 15 container service, installs Python 3.12 dependencies, and runs `pytest`.
* **Frontend Job**: Installs Node 20 dependencies, executes Prettier style checks, runs ESLint linting, and builds the TypeScript bundle.

---

## API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/v1/auth/me` | Fetch current user profile | **Yes** |
| `GET` | `/api/v1/projects` | List projects for current user | **Yes** |
| `POST` | `/api/v1/projects` | Create a new project | **Yes** |
| `GET` | `/api/v1/projects/{id}` | Get project details by ID | **Yes** |
| `PUT` | `/api/v1/projects/{id}` | Update existing project | **Yes** |
| `DELETE` | `/api/v1/projects/{id}` | Delete project & associated sites | **Yes** |
| `GET` | `/api/v1/projects/{id}/sites` | List sites for a project | **Yes** |
| `POST` | `/api/v1/projects/{id}/sites` | Create site with GeoJSON polygon | **Yes** |
| `GET` | `/api/v1/sites/{id}` | Get site details and spatial geometry | **Yes** |
| `PUT` | `/api/v1/sites/{id}` | Update site metadata or geometry | **Yes** |
| `DELETE` | `/api/v1/sites/{id}` | Delete site & site analytics | **Yes** |
| `GET` | `/api/v1/sites/{id}/analytics` | Get analytics history for site | **Yes** |
| `POST` | `/api/v1/sites/{id}/analytics` | Log new carbon/biodiversity entry | **Yes** |
| `GET` | `/health` | System status & database connection health | No |

---

## Project Structure

```text
Darukaa.Earth/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD Pipeline
├── .husky/
│   └── pre-commit                 # Git pre-commit code quality hook
├── docs/
│   └── Darukaa___FullStack_Hackathon_(1)_revised_613627.pdf
├── frontend/
│   ├── src/
│   │   ├── api/                   # Typed API HTTP client modules
│   │   ├── components/
│   │   │   ├── Layout/            # Navbar, ProtectedRoute, PublicRoute
│   │   │   ├── Map/               # ProjectMap (Mapbox GL JS + Draw)
│   │   │   ├── Projects/          # CreateProjectModal, ProjectCard
│   │   │   ├── Sites/             # CreateSiteModal, SiteAnalyticsModal, SiteInspectionSheet
│   │   │   └── ui/                # UI primitives (Card, Dialog, Sheet, Badge, Input, Select)
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # JWT Authentication state provider
│   │   ├── pages/                 # Route views (Dashboard, ProjectDetails, Login, Register)
│   │   ├── types/                 # TypeScript interfaces (Auth, Project, Site, Analytics)
│   │   ├── App.tsx                # React Router setup & route protection
│   │   └── main.tsx
│   ├── public/
│   ├── .env.example               # Frontend environment template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vercel.json                # Vercel SPA routing rewrite rules
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/                   # FastAPI endpoint handlers (auth, projects, sites, analytics)
│   │   ├── core/                  # Configuration & Security (JWT, Bcrypt)
│   │   ├── database/              # Engine, Session & PostGIS initialization
│   │   ├── models/                # SQLAlchemy models (User, Project, Site, Analytics)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # Business logic & GeoJSON geometry processing
│   │   └── main.py
│   ├── tests/                     # Pytest suite (15 tests)
│   ├── .env.example               # Backend environment template
│   ├── .python-version            # Python version pin (3.12.7)
│   └── requirements.txt           # Python production dependencies
├── docker-compose.yml             # Local PostGIS database service definition
├── package.json                   # Root monorepo configuration (Husky + lint-staged)
└── README.md
```

---

## Assignment Requirements Mapping

| Assignment Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Full-Stack Application** | React + TypeScript frontend connected to FastAPI Python backend via REST API. | **Verified** |
| **Geospatial Mapping** | Interactive Mapbox GL JS map with vector polygon drawing via `@mapbox/mapbox-gl-draw`. | **Verified** |
| **Spatial Database** | PostgreSQL with PostGIS extension (`GEOMETRY(POLYGON, 4326)`). | **Verified** |
| **JWT Authentication** | Secure User Registration/Login flow with Bcrypt password hashing and JWT tokens. | **Verified** |
| **Time-Series Analytics** | Highcharts dual-axis visualization tracking Carbon ($tCO_2e$) and Biodiversity scores. | **Verified** |
| **Public Cloud Deployment** | Frontend deployed to Vercel, Backend deployed to Render, Database hosted on Azure PostgreSQL. | **Verified** |
| **Automated Testing & Quality** | 15 backend tests (`pytest`), ESLint, Prettier, and GitHub Actions CI workflow. | **Verified** |
