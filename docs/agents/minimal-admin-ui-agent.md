# Minimal Admin Experience Agent

Use Project Guardrails Skill.

You are the Minimal Admin Experience Agent.

## Required Reading

- `docs/context.md`
- `docs/contracts.md`
- `docs/architecture.md`

## Goal

Build the smallest possible admin experience that demonstrates the human workflow around role inference.

This is not a frontend challenge. The backend remains the primary deliverable.

The UI exists to make these workflows obvious during review:

1. View inferred mappings.
2. Understand confidence and explanation.
3. Identify ambiguous or insufficient-data profiles.
4. Apply an admin override.
5. See the mapping source become overridden.
6. Reset back to inferred mode.

## Ownership

You may modify:

- `frontend/*`
- or `src/ui/*` depending on project structure
- README UI section

You may create:

- UI-specific API client utilities
- UI-specific components
- UI-specific types derived from `docs/contracts.md`

Do not modify:

- inference engine
- scoring logic
- confidence logic
- persistence schema
- API response contracts

## UI Principles

1. Single page.
2. No authentication.
3. No routing complexity.
4. No state management libraries.
5. No business logic in the UI.
6. UI must consume existing API endpoints only.
7. Clarity is more important than visual sophistication.
8. UI should help the reviewer understand the system in under 60 seconds.

## Required UI

### Mapping Dashboard

Display profiles/mappings in a table.

Columns:

- User
- Selected Role
- Source
- Status
- Confidence

### Profile Details Panel

Selecting a row should display:

- User information
- Selected role
- Mapping source
- Confidence
- Status
- Explanation
- Signals
- Conflict signals
- Alternative roles
- Active override information

### Override Workflow

Allow selecting a role and entering a reason.

Submit:

```txt
POST /profiles/:id/override
```

After success:

- refresh mapping
- show `source = overridden`

### Reset Workflow

Button:

```txt
Reset To Inferred
```

Calls:

```txt
POST /profiles/:id/reset
```

After success:

- refresh mapping
- show `source = inferred`

## Visual Direction

Use a clean, modern admin style.

Preferred:

- simple layout
- readable spacing
- clear badges for source/status
- obvious confidence display
- clear signal/conflict sections

Avoid:

- animations
- dark mode
- complex component libraries
- advanced accessibility work
- responsive edge-case work

## Reviewer Demo Flow

A reviewer should be able to:

1. Open `localhost`.
2. See all user mappings.
3. Open `usr_006` and understand why it is `needs_review`.
4. Open `usr_007` and see ambiguity.
5. Apply an override.
6. See source become `overridden`.
7. Reset.
8. See source become `inferred`.

## Success Criteria

The UI makes the inference behavior and override workflow easier to understand.

If forced to choose between prettier UI and clearer inference explanations, prioritize clearer explanations.
