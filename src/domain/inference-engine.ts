import { createHash } from "node:crypto";
import type { InferenceResult, Role, SsoProfile } from "../shared/types.js";
import { ROLE_DATASET_VERSION } from "../data/work-architecture.js";
import { buildExplanation } from "./explanation-builder.js";
import { normalizeProfile } from "./profile-normalizer.js";
import { scoreRole, type ScoredCandidate } from "./role-scorer.js";

export const MODEL_VERSION = "deterministic-v1";

export function inferRole(profile: SsoProfile, roles: Role[]): InferenceResult {
  const normalized = normalizeProfile(profile);
  const inputHash = hashProfile(profile);

  if (normalized.usefulSignalCount <= 1) {
    return {
      inferredRoleId: null,
      inferredRoleName: null,
      confidence: 0,
      status: "insufficient_data",
      explanation: buildExplanation(null, "insufficient_data", []),
      signals: [],
      conflictSignals: [],
      alternatives: [],
      modelVersion: MODEL_VERSION,
      roleDatasetVersion: roles[0]?.roleDatasetVersion ?? ROLE_DATASET_VERSION,
      inputHash
    };
  }

  const candidates = roles
    .map((role) => scoreRole(normalized, role))
    .sort((left, right) => right.score - left.score);

  const best = candidates[0] ?? null;
  const second = candidates[1] ?? null;
  const margin = best && second ? best.score - second.score : best?.score ?? 0;
  const conflictSignals = best?.conflictSignals ?? [];
  const confidence = best ? calculateConfidence(best, margin, normalized.completeness, conflictSignals.length) : 0;
  const status = classifyStatus(confidence, margin, conflictSignals.length);
  const selected = status === "insufficient_data" ? null : best;

  return {
    inferredRoleId: selected?.roleId ?? null,
    inferredRoleName: selected?.roleName ?? null,
    confidence,
    status,
    explanation: buildExplanation(selected, status, conflictSignals),
    signals: selected?.matchedSignals ?? [],
    conflictSignals,
    alternatives: candidates.slice(1, 4).map(({ weightedScore, ...candidate }) => candidate),
    modelVersion: MODEL_VERSION,
    roleDatasetVersion: roles[0]?.roleDatasetVersion ?? ROLE_DATASET_VERSION,
    inputHash
  };
}

function calculateConfidence(best: ScoredCandidate, margin: number, completeness: number, conflictCount: number) {
  const marginBonus = Math.min(0.12, Math.max(0, margin) * 0.35);
  const completenessAdjustment = (completeness - 0.5) * 0.18;
  const conflictPenalty = Math.min(0.22, conflictCount * 0.08);
  const confidence = best.score + marginBonus + completenessAdjustment - conflictPenalty;
  return Math.round(Math.max(0, Math.min(1, confidence)) * 100) / 100;
}

function classifyStatus(confidence: number, margin: number, conflictCount: number) {
  if (confidence < 0.25) {
    return "insufficient_data";
  }

  if (confidence >= 0.75 && margin >= 0.12 && conflictCount === 0) {
    return "inferred";
  }

  return "needs_review";
}

function hashProfile(profile: SsoProfile) {
  return createHash("sha256").update(JSON.stringify(sortObject(profile))).digest("hex");
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, sortObject(entryValue)])
    );
  }

  return value;
}

