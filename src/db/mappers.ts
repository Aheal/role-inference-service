import type { Role as PersistedRole } from "@prisma/client";
import type { Role } from "../shared/types.js";

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
