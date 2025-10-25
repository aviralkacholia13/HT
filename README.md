# Lablens – Lab Test Record App Design

This repository captures the product and experience design for **Lablens**, a modern lab results companion application. The MVP scope focuses on helping individuals consolidate lab PDFs/images, extract structured observations, normalize them against canonical vocabularies, and visualize trends with educational context.

## Repository Layout
```
/lablens/
  README.md
  docker-compose.yml          # planned infra definition (future work)
  .github/workflows/ci.yml    # planned CI pipeline (future work)
  packages/
    frontend/                 # Next.js 14 app (to be implemented)
    api/                      # FastAPI backend (to be implemented)
    parser/                   # Celery parsing worker (to be implemented)
    shared/                   # shared assets (dictionaries, schemas)
  infra/
    nginx/                    # reverse proxy configuration
    migrations/               # database migrations (Alembic)
  docs/
    design.md                 # product & UX design blueprint
```

> **Status:** The repo currently contains design documentation and scaffolding directories. Implementation will follow the milestones outlined in the design.

## Getting Started (Future Development)
1. Clone the repository and create a `.env` from `.env.example`.
2. Use `docker-compose up` (to be added) for local development with FastAPI, Next.js, Redis, Postgres, and MinIO services.
3. Run database migrations via Alembic before interacting with the API.
4. Seed canonical dictionaries using `scripts/seed_dicts.py` (planned).

Refer to [`docs/design.md`](docs/design.md) for detailed product requirements, UI guidelines, and architectural decisions aligned with the provided implementation plan.
