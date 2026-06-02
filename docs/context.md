# Project Context

## Project

Role Inference Service

## Goal

Map messy SSO user profiles to canonical Work Architecture roles with explainability, confidence scoring, auditability, and admin override/reset support.

## Core Direction

Backend-first solution with Docker-first local runtime. The inference engine is the core of the assignment. A minimal admin surface is implemented as a CLI demo first; a simple UI is delayed unless time remains.

## Core Flow

SSO profile -> ingest/upsert -> normalize -> infer automatically unless overridden -> persist inference -> resolve mapping -> return current state.

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Zod
- Prisma
- SQLite
- Docker
- Docker Compose
- Vitest

## Architecture Principles

1. Deterministic-first inference.
2. No opaque LLM classification.
3. Domain logic remains pure.
4. API routes orchestrate workflows.
5. `POST /profiles` runs inference automatically unless an active override exists.
6. Overrides suppress automatic mapping changes.
7. Reset deactivates override and re-runs inference.
8. Confidence accounts for score, margin, completeness, and conflicts.
9. Mapping responses include selected role, source, latest inference, and active override.
10. Docker allows local handoff in under 10 minutes.

## Main Entities

- Role
- UserProfile
- RoleInference
- RoleOverride

## Current Scope

- Profile ingestion/upsert
- Automatic inference on ingest/update
- Manual re-inference endpoint
- Confidence scoring
- Explainability
- Override workflow
- Reset workflow
- Persistence
- CLI demo

## Out of Scope

- Real SSO integration
- Production auth
- Background queue
- Full observability stack
- Multi-tenancy
- Production deployment
