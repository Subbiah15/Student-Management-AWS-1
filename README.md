# School Management System

A portfolio-focused school management platform built with FastAPI, PostgreSQL, AsyncPG, Pydantic, Next.js, TypeScript, Tailwind CSS, and Radix UI.

The project is intentionally scoped around a smaller set of well-engineered modules instead of a broad set of shallow features. The target is to demonstrate architecture, database design, security, testing, documentation, maintainability, and a polished SaaS-style user experience.

## Current Status

This repository is in the audit and foundation phase.

Implemented today:

- Basic Docker Compose setup for PostgreSQL, FastAPI, and Next.js.
- Basic API version prefix for students, teachers, and classes.
- Non-destructive initial PostgreSQL schema bootstrap for teachers, classes, students, attendance, grades, and school fees.
- Synthetic seed records for local demonstration only; they are not institutional data.
- Initial frontend pages and reusable UI components.
- Architecture and database documentation.

Not production-ready yet:

- Authentication and authorization for administrators, teachers, and students are not implemented.
- Server-side role-based data access is not implemented.
- Audit logs are not implemented.
- Database migrations are not implemented.
- Teacher management, subjects, examinations, fee/payment workflows, notifications, and institution settings are incomplete or missing.
- Attendance history, report cards, payments, and analytics APIs are incomplete or missing.
- The current frontend does not provide all required pages or role-specific navigation.
- Automated backend, frontend, and end-to-end tests are not yet present.

## Product Scope

Core modules:

- Authentication and authorization: administrator, teacher, and student roles, secure sessions, password handling, and server-side authorization.
- Student management: profiles, enrollment, search, filtering, pagination, sorting, and status tracking.
- Teacher, class, and subject management: profiles, assignments, enrollment, and capacity tracking.
- Academic records: examinations, assessments, grades, configurable calculations, and report cards.
- Attendance: daily marking, history, summaries, and analytics.
- Finance: fee structures, invoices, payment history, outstanding balances, and financial summaries.
- Reporting, notifications, announcements, user profiles, and institution settings.
- Role-aware dashboards with metrics derived from application records.

Explicitly out of scope:

- Messaging systems.
- Chat platforms.
- Parent portal.
- Medical records.
- Complex scheduling engines.
- Mobile apps.
- Multi-tenant SaaS.

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Design](docs/DATABASE.md)

## Tech Stack

Backend:

- FastAPI
- PostgreSQL
- AsyncPG
- Pydantic

Frontend:

- Next.js 16
- TypeScript
- React Hook Form
- Tailwind CSS
- Radix UI

Infrastructure:

- Docker
- Docker Compose

## Quick Start

Prerequisites:

- Docker and Docker Compose
- Git

Create local environment variables:

```bash
cp .env.example .env
```

Update `.env` with local database credentials, then start the stack:

```bash
docker-compose up --build
```

Local URLs:

| Component | URL | Purpose |
| --- | --- | --- |
| Frontend | http://localhost:3000 | Web application |
| API | http://localhost:8000 | FastAPI service |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | API reference |

## Docker Hub and Minikube

The application has separate frontend, backend, and PostgreSQL images. The PostgreSQL image initializes a fresh database from `db/schema.sql` and `db/seed.sql`. These Kubernetes files run the same three services without changing the existing EC2 deployment.

### Build and publish the images

Create a Docker Hub account if you do not have one, create three **public** repositories named `school-management-frontend`, `school-management-backend`, and `school-management-db`, then sign in locally with `docker login`. From the Project 1 directory, these commands use the configured Docker Hub username `subbiah15`:

```powershell
$DockerHubUser = "YOUR_DOCKERHUB_USERNAME"
docker build -t "$DockerHubUser/school-management-frontend:latest" -f frontend/Dockerfile frontend
docker build -t "$DockerHubUser/school-management-backend:latest" -f backend/Dockerfile backend
docker build -t "$DockerHubUser/school-management-db:latest" -f db/Dockerfile .

docker push "$DockerHubUser/school-management-frontend:latest"
docker push "$DockerHubUser/school-management-backend:latest"
docker push "$DockerHubUser/school-management-db:latest"
```

The frontend is exported as static files and served by Nginx, which also proxies the `/api` requests to the Kubernetes `backend` Service. The Docker Hub links are:

- `https://hub.docker.com/r/subbiah15/school-management-frontend`
- `https://hub.docker.com/r/subbiah15/school-management-backend`
- `https://hub.docker.com/r/subbiah15/school-management-db`

### Start Minikube and deploy

On Windows, install Minikube if needed with `winget install Kubernetes.minikube`, then start it using Docker Desktop:

```powershell
minikube start --driver=docker
```

Create the Kubernetes Secret from the local `.env` file. The file is git-ignored; do not put real passwords in manifests or commit `.env`:

```powershell
kubectl create secret generic school-db --from-env-file=.env --dry-run=client -o yaml | kubectl apply -f -
```

The deployment file already references the `subbiah15` images, so apply it directly:

```powershell
kubectl apply -f service.yaml
kubectl apply -f deployment.yaml
kubectl get pods
kubectl get services
kubectl rollout status deployment/db
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
minikube service frontend
```

The frontend is exposed through a Minikube NodePort Service. `minikube service frontend` opens it in a browser; `minikube service frontend --url` prints its URL. The app is for the local Minikube demonstration and does not replace or publish the existing EC2 deployment.

## Development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Repository Structure

```text
school-management-system/
├── backend/                # FastAPI application
├── db/                     # Current SQL schema and seed scripts
├── docs/                   # Architecture, audit, database, and roadmap docs
├── frontend/               # Next.js application
├── docker-compose.yml      # Local service orchestration
└── README.md
```

## Engineering Standard

The project should evolve through small, reviewed increments:

1. Audit the current behavior.
2. Document the decision being made.
3. Implement a focused change.
4. Add or update tests.
5. Update documentation.
6. Keep unfinished or out-of-scope features out of the primary product surface.
