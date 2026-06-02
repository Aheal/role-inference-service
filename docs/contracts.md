# Contracts

`docs/contracts.md` is the source of truth for shared domain and API shapes. If implementation contracts change, update this file first.

## Domain Types

```ts
export interface SsoProfile {
  userId: string;
  displayName: string;
  title?: string | null;
  department?: string | null;
  managerTitle?: string | null;
  businessUnit?: string | null;
  groups: string[];
  skills: string[];
  location?: string | null;
  notes?: string | null;
}

export interface Role {
  roleId: string;
  roleName: string;
  department: string;
  jobFamily: string;
  seniority: string;
  skills: string[];
  keywords: string[];
  roleDatasetVersion: string;
}

export interface CandidateScore {
  roleId: string;
  roleName: string;
  score: number;
  confidence: number;
  matchedSignals: string[];
  conflictSignals: string[];
}

export type InferenceStatus =
  | "inferred"
  | "needs_review"
  | "insufficient_data";

export interface InferenceResult {
  inferredRoleId: string | null;
  inferredRoleName: string | null;
  confidence: number;
  status: InferenceStatus;
  explanation: string;
  signals: string[];
  conflictSignals: string[];
  alternatives: CandidateScore[];
  modelVersion: string;
  roleDatasetVersion: string;
  inputHash: string;
}

export type MappingSource = "inferred" | "overridden";

export interface CurrentMapping {
  userId: string;
  source: MappingSource;
  selectedRole: Role | null;
  latestInference: InferenceResult | null;
  activeOverride: {
    role: Role;
    reason: string;
    overriddenBy: string;
    createdAt: string;
  } | null;
}
```

## API Contracts

### GET /health

Returns service health.

### GET /roles

Returns seeded Work Architecture roles.

### GET /profiles

Returns stored profiles.

### POST /profiles

Creates or updates a profile.

Behavior:

1. Validate payload with shared Zod schemas.
2. Upsert profile.
3. Normalize profile.
4. If no active override exists, run inference immediately.
5. If active override exists, persist profile update but keep current override as selected mapping.
6. Return current mapping.

Returns:

```ts
CurrentMapping
```

### POST /profiles/:id/infer

Manually re-runs inference for a profile.

Behavior:

- Always creates a new inference result.
- Does not remove active override.
- Mapping source remains overridden if override exists.
- Useful for demo and reprocessing.

Returns:

```ts
CurrentMapping
```

### GET /profiles/:id/mapping

Returns current mapping resolution.

Returns:

```ts
CurrentMapping
```

### POST /profiles/:id/override

Request:

```ts
{
  roleId: string;
  reason: string;
  overriddenBy?: string;
}
```

Behavior:

- Creates active override.
- Current mapping source becomes overridden.
- Latest inference is preserved for auditability.

Returns:

```ts
CurrentMapping
```

### POST /profiles/:id/reset

Behavior:

1. Deactivates active override.
2. Re-runs inference against latest stored profile.
3. Current mapping source becomes inferred.

Returns:

```ts
CurrentMapping
```
