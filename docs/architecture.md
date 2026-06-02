# Role Inference Service Architecture

## Context

Enterprise SSO providers return inconsistent user profile data. Titles, departments, groups, skills, manager titles, and notes may be incomplete or noisy. This service maps those profiles to canonical Work Architecture roles while making decisions explainable, auditable, and correctable by an admin.

The solution is backend-first because the core value is the inference pipeline, state model, override behavior, and async handoff.

## Goals

- Ingest and upsert SSO profiles.
- Run inference automatically on profile ingest/update unless an active override exists.
- Infer the most likely canonical role.
- Return confidence, explanation, key signals, conflict signals, and alternatives.
- Persist profiles, inferences, and overrides.
- Allow admin override.
- Allow reset back to inferred mode.
- Track model version, role dataset version, and input hash.
- Run locally in under 10 minutes using Docker.

## Non-Goals

- Real SSO integration.
- Production auth.
- Full background queue.
- Production observability.
- Multi-tenant authorization.
- Polished UI.
- Opaque LLM-based classification.

## Runtime

- Node.js
- TypeScript
- Fastify
- Zod
- Prisma
- SQLite
- Docker
- Docker Compose
- Vitest

The project should run with:

```bash
docker compose up --build
```

SQLite data should persist through a Docker volume.

## High-Level Flow

```txt
POST /profiles
  -> validate with Zod
  -> upsert UserProfile
  -> normalize profile
  -> check active override
  -> if no override, run inference
  -> if override, keep selected role pinned
  -> return CurrentMapping
```

## Domain Pipeline

```txt
Raw profile
  -> Profile Normalizer
  -> Role Scorer
  -> Candidate Ranking
  -> Confidence Calculator
  -> Explanation Builder
  -> Inference Result
```

## Core Design Decision

The inference pipeline is deterministic-first. The system does not ask an LLM to directly choose a role. Instead, it scores every role using structured signals:

- Title similarity
- Department alignment
- Job-family alignment
- Seniority
- Skills overlap
- Group membership relevance
- Manager title
- Role keywords
- Business unit
- Notes

This makes the result auditable, testable, explainable, and safe to override.

## Confidence Strategy

Confidence is not only the raw weighted score.

```txt
confidence =
  weighted signal score
  + top candidate margin bonus
  + data completeness adjustment
  - conflict penalty
```

Important cases:

- Strong top score + strong margin + complete profile -> high confidence.
- Decent top score + close second candidate -> needs review.
- Sparse profile -> insufficient data.
- Conflicting title/department/skills -> lower confidence.

Suggested statuses:

```txt
>= 0.75       inferred
0.45-0.74     needs_review
< 0.45        insufficient_data
```

## Mapping Resolution

The mapping endpoint always returns a complete view:

```txt
source
selectedRole
latestInference
activeOverride
status
confidence
explanation
alternatives
```

Resolution rule:

```txt
If active override exists:
  selectedRole = override role
  source = overridden
  latestInference is still included
Else:
  selectedRole = latest inferred role
  source = inferred
```

Overrides do not delete inference results. They pin the selected role while preserving system reasoning for auditability.

## Expected Sample Outcomes

- `usr_001` -> Senior Data Analyst, high confidence.
- `usr_002` -> Platform Engineer, high confidence.
- `usr_003` -> Customer Success Manager, medium/high confidence.
- `usr_004` -> Senior Product Manager or Product Manager, depending on seniority handling.
- `usr_005` -> Revenue Operations Manager or Sales Operations Analyst with explanation.
- `usr_006` -> needs review due to vague title, vague department, no skills, and conflicting notes.
- `usr_007` -> needs review due to Engineering title/scope but Data/ML skills.
- `usr_008` -> insufficient data.

## Minimal Admin Surface

The first admin surface is a CLI demo:

```bash
npm run demo
```

The demo should:

1. Seed roles.
2. Ingest sample profiles.
3. Show mappings.
4. Override a user.
5. Show `source = overridden`.
6. Reset the user.
7. Show `source = inferred`.

A small UI can be added later to visualize the same API behavior.

## Known Limitations

- No real SSO integration.
- No auth.
- No background reprocessing queue.
- No full audit event stream.
- SQLite is local-only.
- Scoring weights are heuristic.
- No labeled evaluation dataset beyond sample cases.
- Minimal admin surface.
- No production deployment.

## AI Usage Strategy

AI tools are used to accelerate architecture review, implementation planning, test generation, edge-case analysis, code review, README drafting, and walkthrough preparation.

Course correction approach:

- Keep shared contracts stable.
- Review AI-generated code manually.
- Reject implementations that turn inference into one opaque LLM prompt.
- Keep domain logic pure.
- Use tests for ambiguous and insufficient-data profiles.
- Track token utilization qualitatively and document where scoped agent prompts reduced repeated context.
