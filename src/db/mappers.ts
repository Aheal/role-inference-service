import type { Role as PersistedRole, RoleInference as PersistedInference } from "@prisma/client";
import type { CandidateScore, InferenceResult, Role } from "../shared/types.js";

export function stringifyJson(value: unknown) {
  return JSON.stringify(value);
}

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toPersistedRoleInput(role: Role) {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    department: role.department,
    jobFamily: role.jobFamily,
    seniority: role.seniority,
    skills: stringifyJson(role.skills),
    keywords: stringifyJson(role.keywords),
    roleDatasetVersion: role.roleDatasetVersion
  };
}

export function toDomainRole(role: PersistedRole): Role {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    department: role.department,
    jobFamily: role.jobFamily,
    seniority: role.seniority,
    skills: parseJson<string[]>(role.skills, []),
    keywords: parseJson<string[]>(role.keywords, []),
    roleDatasetVersion: role.roleDatasetVersion
  };
}

export function toDomainInference(
  inference: PersistedInference & { inferredRole?: PersistedRole | null }
): InferenceResult {
  return {
    inferredRoleId: inference.inferredRoleId,
    inferredRoleName: inference.inferredRole?.roleName ?? null,
    confidence: inference.confidence,
    status: inference.status as InferenceResult["status"],
    explanation: inference.explanation,
    signals: parseJson<string[]>(inference.signals, []),
    conflictSignals: parseJson<string[]>(inference.conflictSignals, []),
    alternatives: parseJson<CandidateScore[]>(inference.alternatives, []),
    modelVersion: inference.modelVersion,
    roleDatasetVersion: inference.roleDatasetVersion,
    inputHash: inference.inputHash
  };
}

export function toPersistedInferenceInput(userProfileId: string, inference: InferenceResult) {
  return {
    userProfileId,
    inferredRoleId: inference.inferredRoleId,
    confidence: inference.confidence,
    status: inference.status,
    explanation: inference.explanation,
    signals: stringifyJson(inference.signals),
    conflictSignals: stringifyJson(inference.conflictSignals),
    alternatives: stringifyJson(inference.alternatives),
    modelVersion: inference.modelVersion,
    roleDatasetVersion: inference.roleDatasetVersion,
    inputHash: inference.inputHash
  };
}
