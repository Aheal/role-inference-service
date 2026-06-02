# Skill: Review Checklist

Use this skill for final review.

## Architecture

- Domain is separate from API.
- API is separate from persistence.
- Inference logic is deterministic-first.
- No single LLM prompt chooses the role.
- Docker setup works.

## Contracts

- Types match `docs/contracts.md`.
- API responses match `CurrentMapping`.
- No duplicate incompatible types.
- Zod validates incoming profiles.

## Behavior

- Profile ingest runs inference automatically unless overridden.
- Manual inference does not remove override.
- Manual inference while overridden updates `latestInference` but keeps `source = "overridden"`.
- Override pins selected role.
- Reset removes override and re-runs inference.
- Mapping includes source, selectedRole, latestInference, activeOverride.

## Tests

Must cover:

- strong match
- ambiguous match
- insufficient data
- override
- reset
- sample users `usr_001` through `usr_008`

## Documentation

README explains:

- problem
- setup under 10 minutes
- Docker usage
- architecture
- inference pipeline
- assumptions
- limitations
- what to build next
- AI usage and course correction
- token utilization and context-reduction strategy
