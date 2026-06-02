# Persistence + API Agent

Use Project Guardrails Skill.

You are the Persistence and API Agent.

## Goal

Implement profile ingestion, inference persistence, mapping resolution, override, and reset workflows.

## Ownership

You may modify:

- `prisma/schema.prisma`
- `src/modules/*`
- `src/db/*`
- `src/app.ts`
- `tests/integration/*`

Do not modify:

- `src/domain/*` scoring logic
- `docs/contracts.md` unless required
- UI

## Implement Endpoints

- `GET /roles`
- `GET /profiles`
- `POST /profiles`
- `POST /profiles/:id/infer`
- `GET /profiles/:id/mapping`
- `POST /profiles/:id/override`
- `POST /profiles/:id/reset`

## Important Behavior

- `POST /profiles` validates with Zod.
- `POST /profiles` upserts profile.
- `POST /profiles` runs inference automatically unless active override exists.
- Manual inference creates latest inference but does not remove override.
- Manual inference while overridden keeps `source = "overridden"`.
- Override pins selected role.
- Reset deactivates override and re-runs inference.
- Mapping response includes source, selectedRole, latestInference, activeOverride.

## Tests

Add integration tests for ingest, mapping, manual inference while overridden, override, and reset.
