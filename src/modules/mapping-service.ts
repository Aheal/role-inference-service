import type { UserProfile } from "@prisma/client";
import type { CurrentMapping, InferenceResult, SsoProfile } from "../shared/types.js";
import { ssoProfileSchema } from "../shared/schemas.js";
import { inferRole } from "../domain/inference-engine.js";
import { normalizeProfile } from "../domain/profile-normalizer.js";
import { prisma } from "../db/prisma.js";
import {
  stringifyJson,
  toDomainInference,
  toDomainRole,
  toPersistedInferenceInput
} from "../db/mappers.js";

export async function listRoles() {
  const roles = await prisma.role.findMany({ orderBy: { roleId: "asc" } });
  return roles.map(toDomainRole);
}

export async function listProfiles() {
  return prisma.userProfile.findMany({ orderBy: { externalUserId: "asc" } });
}

export async function ingestProfile(input: unknown): Promise<CurrentMapping> {
  const profile = ssoProfileSchema.parse(input);
  const normalized = normalizeProfile(profile);
  const inferencePreview = inferRole(profile, await listRoles());
  const userProfile = await upsertProfile(profile, inferencePreview, normalized);
  const activeOverride = await findActiveOverride(userProfile.id);

  if (!activeOverride) {
    await createInference(userProfile.id, inferencePreview);
  }

  return resolveCurrentMapping(userProfile.externalUserId);
}

export async function rerunInference(externalUserId: string): Promise<CurrentMapping> {
  const userProfile = await findProfileOrThrow(externalUserId);
  const profile = ssoProfileSchema.parse(JSON.parse(userProfile.rawPayload));
  const inference = inferRole(profile, await listRoles());

  await createInference(userProfile.id, inference);

  return resolveCurrentMapping(externalUserId);
}

export async function resolveCurrentMapping(externalUserId: string): Promise<CurrentMapping> {
  const userProfile = await findProfileOrThrow(externalUserId);
  const [latestInference, activeOverride] = await Promise.all([
    findLatestInference(userProfile.id),
    findActiveOverride(userProfile.id)
  ]);

  if (activeOverride) {
    return {
      userId: externalUserId,
      source: "overridden",
      selectedRole: toDomainRole(activeOverride.role),
      latestInference: latestInference ? toDomainInference(latestInference) : null,
      activeOverride: {
        role: toDomainRole(activeOverride.role),
        reason: activeOverride.reason,
        overriddenBy: activeOverride.overriddenBy,
        createdAt: activeOverride.createdAt.toISOString()
      }
    };
  }

  const inference = latestInference ? toDomainInference(latestInference) : null;
  const selectedRole = latestInference?.inferredRole ? toDomainRole(latestInference.inferredRole) : null;

  return {
    userId: externalUserId,
    source: "inferred",
    selectedRole,
    latestInference: inference,
    activeOverride: null
  };
}

async function upsertProfile(
  profile: SsoProfile,
  inference: InferenceResult,
  normalized: ReturnType<typeof normalizeProfile>
): Promise<UserProfile> {
  return prisma.userProfile.upsert({
    where: { externalUserId: profile.userId },
    update: {
      displayName: profile.displayName,
      rawPayload: stringifyJson(profile),
      normalizedTitle: normalized.title || null,
      normalizedDepartment: normalized.department || null,
      normalizedSkills: stringifyJson(normalized.skills),
      inputHash: inference.inputHash
    },
    create: {
      externalUserId: profile.userId,
      displayName: profile.displayName,
      rawPayload: stringifyJson(profile),
      normalizedTitle: normalized.title || null,
      normalizedDepartment: normalized.department || null,
      normalizedSkills: stringifyJson(normalized.skills),
      inputHash: inference.inputHash
    }
  });
}

async function createInference(userProfileId: string, inference: InferenceResult) {
  return prisma.roleInference.create({
    data: toPersistedInferenceInput(userProfileId, inference)
  });
}

async function findProfileOrThrow(externalUserId: string) {
  const userProfile = await prisma.userProfile.findUnique({
    where: { externalUserId }
  });

  if (!userProfile) {
    throw new Error(`Profile ${externalUserId} not found`);
  }

  return userProfile;
}

async function findLatestInference(userProfileId: string) {
  return prisma.roleInference.findFirst({
    where: { userProfileId },
    orderBy: { createdAt: "desc" },
    include: { inferredRole: true }
  });
}

async function findActiveOverride(userProfileId: string) {
  return prisma.roleOverride.findFirst({
    where: { userProfileId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { role: true }
  });
}

