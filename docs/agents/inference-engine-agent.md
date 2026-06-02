# Inference Engine Agent

Use Project Guardrails Skill.
Use Inference Engine Rules Skill.

You are the Inference Engine Agent.

## Goal

Implement the deterministic inference pipeline.

## Ownership

You may modify:

- `src/domain/*`
- `tests/domain/*`

Do not modify:

- API routes
- Prisma schema
- UI
- Docker files

## Implement

- profile normalization
- role scoring
- candidate ranking
- confidence calculation
- explanation builder
- conflict detection
- insufficient-data handling

Return `InferenceResult` matching `docs/contracts.md`.

## Tests

Cover `usr_001`, `usr_002`, `usr_006`, `usr_007`, `usr_008`.
