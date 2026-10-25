# Logistics Order API — Internal Reference

This is a complete, standalone reference implementation for the logistics-order
exercise. It intentionally lives under `reference/` and is not part of the
student-facing project starter or the Next.js app.

## Run locally

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
cp .env.example .env
uvicorn app.main:app --reload
```

Open `/docs` for the OpenAPI UI. Run tests with `pytest`.

The API provides customer/user registration and JWT authentication, Argon2
password hashing, customer profiles, order creation and visibility rules,
dispatcher/admin driver assignment, shipment tracking, and validated order
lifecycle transitions. SQLite is the default; set `DATABASE_URL` for another
SQLAlchemy-supported database. Change `JWT_SECRET` outside development.
