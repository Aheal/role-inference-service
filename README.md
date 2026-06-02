# Role Inference Service

Backend-first service for mapping messy SSO profiles to canonical Work Architecture roles with explainability, confidence, persistence, and admin override/reset support.

## Setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

## Docker

```bash
docker compose up --build
```

The API listens on port `3000`. SQLite data is persisted in a Docker named volume.

## Current Status

Foundation scaffold is in place. Domain inference, API workflows, demo CLI, tests, and final README sections are implemented in later passes.
