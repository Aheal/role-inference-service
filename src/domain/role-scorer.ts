import type { CandidateScore, Role } from "../shared/types.js";
import type { NormalizedProfile } from "./profile-normalizer.js";
import { normalizeText, overlapRatio, titleSimilarity, tokenSet } from "./text.js";

interface SignalScore {
  label: string;
  score: number;
  weight: number;
  matched?: string;
  conflict?: string;
}

const weights = {
  title: 0.34,
  skills: 0.24,
  department: 0.18,
  groups: 0.08,
  manager: 0.07,
  notes: 0.05,
  seniority: 0.04
};

export interface ScoredCandidate extends CandidateScore {
  weightedScore: number;
}

export function scoreRole(profile: NormalizedProfile, role: Role): ScoredCandidate {
  const signals = signalScores(profile, role);
  const score = clamp(signals.reduce((sum, signal) => sum + signal.score * signal.weight, 0));
  const matchedSignals = signals
    .filter((signal) => signal.score > 0 && signal.matched)
    .map((signal) => signal.matched as string);
  const conflictSignals = signals
    .filter((signal) => signal.conflict)
    .map((signal) => signal.conflict as string);

  return {
    roleId: role.roleId,
    roleName: role.roleName,
    score: round(score),
    confidence: round(score),
    matchedSignals,
    conflictSignals,
    weightedScore: score
  };
}

function signalScores(profile: NormalizedProfile, role: Role): SignalScore[] {
  const roleName = normalizeText(role.roleName);
  const roleDepartment = normalizeText(role.department);
  const roleJobFamily = normalizeText(role.jobFamily);
  const roleSeniority = normalizeText(role.seniority);
  const roleSkills = role.skills.map(normalizeText);
  const roleKeywords = role.keywords.map(normalizeText);
  const roleTokens = tokenSet([roleName, roleDepartment, roleJobFamily, roleSeniority, ...roleSkills, ...roleKeywords]);

  const titleScore = Math.max(
    titleSimilarity(profile.title, roleName),
    overlapRatio(tokenSet([profile.title]), tokenSet([roleJobFamily, ...roleKeywords]))
  );
  const skillScore = overlapRatio(new Set(profile.skills), new Set([...roleSkills, ...roleKeywords]));
  const departmentScore = departmentAlignment(profile.department, roleDepartment, roleJobFamily, roleKeywords);
  const groupScore = overlapRatio(tokenSet(profile.groups), roleTokens);
  const managerScore = overlapRatio(tokenSet([profile.managerTitle]), roleTokens);
  const notesScore = overlapRatio(tokenSet([profile.notes]), roleTokens);
  const seniorityScore = profile.title && roleSeniority ? titleSimilarity(profile.title, roleSeniority) : 0;

  const conflicts: string[] = [];
  if (profile.department && departmentScore === 0 && titleScore >= 0.55) {
    conflicts.push(`Department "${profile.raw.department}" does not align with ${role.department}.`);
  }
  if (profile.skills.length > 0 && skillScore === 0 && titleScore >= 0.55) {
    conflicts.push(`Skills do not overlap with ${role.roleName}.`);
  }
  if (profile.notes.includes("sales") && !roleDepartment.includes("sales") && !roleDepartment.includes("revenue")) {
    conflicts.push(`Notes mention Sales transfer, which conflicts with ${role.department}.`);
  }

  return [
    {
      label: "title",
      score: titleScore,
      weight: weights.title,
      matched: titleScore > 0 ? `Title "${profile.raw.title}" matched ${role.roleName}.` : undefined,
      conflict: conflicts[0]
    },
    {
      label: "skills",
      score: skillScore,
      weight: weights.skills,
      matched: skillScore > 0 ? `Skills overlap with ${role.roleName}: ${matchedValues(profile.skills, [...roleSkills, ...roleKeywords]).join(", ")}.` : undefined,
      conflict: conflicts[1]
    },
    {
      label: "department",
      score: departmentScore,
      weight: weights.department,
      matched: departmentScore > 0 ? `Department "${profile.raw.department}" provides context for ${role.roleName}.` : undefined,
      conflict: conflicts[2]
    },
    {
      label: "groups",
      score: groupScore,
      weight: weights.groups,
      matched: groupScore > 0 ? `Groups support ${role.roleName}.` : undefined
    },
    {
      label: "manager",
      score: managerScore,
      weight: weights.manager,
      matched: managerScore > 0 ? `Manager title "${profile.raw.managerTitle}" supports ${role.roleName}.` : undefined
    },
    {
      label: "notes",
      score: notesScore,
      weight: weights.notes,
      matched: notesScore > 0 ? `Notes contain context relevant to ${role.roleName}.` : undefined
    },
    {
      label: "seniority",
      score: seniorityScore,
      weight: weights.seniority,
      matched: seniorityScore > 0 ? `Seniority signal aligns with ${role.seniority}.` : undefined
    }
  ];
}

function departmentAlignment(department: string, roleDepartment: string, roleJobFamily: string, roleKeywords: string[]) {
  if (!department) {
    return 0;
  }

  if (department === roleDepartment) {
    return 1;
  }

  const departmentTokens = tokenSet([department]);
  const roleTokens = tokenSet([roleDepartment, roleJobFamily, ...roleKeywords]);
  return overlapRatio(departmentTokens, roleTokens);
}

function matchedValues(source: string[], target: string[]) {
  const targetSet = new Set(target);
  return source.filter((value) => targetSet.has(value));
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
