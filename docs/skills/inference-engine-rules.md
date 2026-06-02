# Skill: Inference Engine Rules

Use this skill for domain, tests, and review.

## Pipeline

```txt
Raw Profile
-> Normalize
-> Score Every Role
-> Rank Candidates
-> Calculate Confidence
-> Build Explanation
-> Return InferenceResult
```

## Scoring Signals

Use available signals only:

- title similarity
- department alignment
- job-family alignment
- seniority
- skills overlap
- group relevance
- manager title
- role keywords
- business unit
- notes

## Confidence

Confidence must consider:

- top weighted score
- margin from second-best candidate
- data completeness
- conflict penalties

Do not use raw score alone as confidence.

## Status Rules

- high confidence and clear winner -> inferred
- close candidates or conflicting signals -> needs_review
- sparse or unusable profile -> insufficient_data

## Required Hard Cases

- `usr_001` -> Senior Data Analyst, high confidence
- `usr_002` -> Platform Engineer, high confidence
- `usr_006` -> needs_review
- `usr_007` -> needs_review / ambiguous
- `usr_008` -> insufficient_data

## Explanation Rules

Explanations must be generated from actual scoring signals.

Do not invent reasoning.
Do not say a signal contributed if it was not used.
Do not hide ambiguity.
