import type { SsoProfile } from "../shared/types.js";
import { normalizeText } from "./text.js";

export interface NormalizedProfile {
  raw: SsoProfile;
  title: string;
  department: string;
  managerTitle: string;
  businessUnit: string;
  groups: string[];
  skills: string[];
  notes: string;
  usefulSignalCount: number;
  completeness: number;
}

export function normalizeProfile(profile: SsoProfile): NormalizedProfile {
  const groups = profile.groups.map(normalizeText).filter(Boolean);
  const skills = profile.skills.map(normalizeText).filter(Boolean);
  const title = normalizeText(profile.title);
  const department = normalizeText(profile.department);
  const managerTitle = normalizeText(profile.managerTitle);
  const businessUnit = normalizeText(profile.businessUnit);
  const notes = normalizeText(profile.notes);

  const usefulSignalCount = [
    title,
    department,
    managerTitle,
    businessUnit,
    notes,
    skills.length > 0 ? "skills" : "",
    groups.some((group) => group !== "all staff" && group !== "contractors") ? "groups" : ""
  ].filter(Boolean).length;

  return {
    raw: profile,
    title,
    department,
    managerTitle,
    businessUnit,
    groups,
    skills,
    notes,
    usefulSignalCount,
    completeness: usefulSignalCount / 7
  };
}

