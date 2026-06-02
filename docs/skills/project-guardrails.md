# Skill: Project Guardrails

Use this skill in every agent.

## Required Reading

- `docs/context.md`
- `docs/contracts.md`

Use `docs/architecture.md` only when more context is needed.

## Rules

1. Keep the project backend-first.
2. Preserve deterministic-first inference.
3. Do not introduce opaque LLM classification.
4. Keep domain logic pure.
5. API routes orchestrate workflows; they do not contain scoring logic.
6. Persistence stores state; it does not make inference decisions.
7. UI or CLI only consumes API/domain state.
8. Do not modify shared contracts unless required.
9. If contracts change, update `docs/contracts.md` first.
10. Stay inside the assigned ownership area.
11. Prefer small, reviewable changes.
12. Add or update tests for meaningful behavior changes.

## Runtime Requirements

- Node.js
- TypeScript
- Fastify
- Zod
- Prisma
- SQLite
- Docker
- Docker Compose
- Vitest

## Core Behavior

- `POST /profiles` upserts a profile.
- `POST /profiles` runs inference automatically unless an active override exists.
- Overrides suppress automatic mapping changes.
- Reset deactivates override and re-runs inference.
- Mapping response includes source, selectedRole, latestInference, and activeOverride.
