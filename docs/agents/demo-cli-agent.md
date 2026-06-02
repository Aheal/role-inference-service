# Demo CLI Agent

Use Project Guardrails Skill.

You are the Demo CLI Agent.

## Goal

Create a clean demo path for the recorded walkthrough.

## Ownership

You may modify:

- `scripts/*`
- `src/demo/*`
- `package.json` demo script
- README demo section

Do not modify:

- inference engine
- API behavior
- Prisma schema unless absolutely required

## Implement

`npm run demo`

Demo should:

1. Seed roles.
2. Ingest sample profiles.
3. Print mappings.
4. Show `usr_006`, `usr_007`, and `usr_008` outcomes.
5. Override `usr_007`.
6. Show `source = overridden`.
7. Run manual inference while overridden and show latest inference updates.
8. Reset `usr_007`.
9. Show `source = inferred`.
10. Print explanations and alternatives.

Output should be readable in a terminal and useful for a video walkthrough.
