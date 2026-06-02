# Setup Agent

Use Project Guardrails Skill.

You are the Setup Agent.

## Goal

Create the initial project foundation for Role Inference Service.

## Internal Passes

1. Docs/contracts/skills/agent handoffs.
2. Scaffold/runtime/Docker.
3. Seed data.

## Ownership

You may modify:

- `package.json`
- `tsconfig.json`
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.gitignore`
- `prisma/*`
- `src/main.ts`
- `src/app.ts`
- `src/db/*`
- `src/data/*`
- `src/shared/*`
- `docs/*`
- initial `README.md` setup section

Do not implement full inference logic.
Do not implement override behavior.
Do not build UI.

## Deliver

- Fastify server
- `GET /health`
- Prisma + SQLite
- Docker Compose
- SQLite persisted via Docker volume
- Seed data files
- Basic scripts: `dev`, `build`, `start`, `test`, `db:migrate`, `db:seed`, `demo`
- Shared types matching `docs/contracts.md`
- README instructions for npm and Docker

## Success

`docker compose up --build` starts the API on port 3000.
