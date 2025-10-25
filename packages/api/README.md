# API (FastAPI)

This package will contain the FastAPI backend implementing authentication, document management, observations APIs, and insights endpoints described in `docs/design.md`.

## Planned Components
- FastAPI + Uvicorn
- SQLAlchemy + Alembic for migrations
- JWT authentication with httpOnly cookies
- S3/MinIO integration for document storage
- Redis (via Celery) task enqueuing for parser coordination

Security considerations such as RBAC, rate limiting, and audit logging are detailed in the design blueprint.
