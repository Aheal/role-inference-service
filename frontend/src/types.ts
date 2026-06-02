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

export type InferenceStatus = "inferred" | "needs_review" | "insufficient_data";
export type MappingSource = "inferred" | "overridden";

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

export interface StoredProfile {
  id: string;
  externalUserId: string;
  displayName: string;
  rawPayload: string;
  normalizedTitle: string | null;
  normalizedDepartment: string | null;
  normalizedSkills: string;
  inputHash: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface MappingRow {
  profile: StoredProfile;
  mapping: CurrentMapping;
}

