import type { CurrentMapping, Role, SsoProfile, StoredProfile } from "./types.js";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export function getRoles() {
  return request<Role[]>("/roles");
}

export function getProfiles() {
  return request<StoredProfile[]>("/profiles");
}

export function ingestProfile(profile: SsoProfile) {
  return request<CurrentMapping>("/profiles", {
    method: "POST",
    body: JSON.stringify(profile)
  });
}

export function getMapping(userId: string) {
  return request<CurrentMapping>("/profiles/" + encodeURIComponent(userId) + "/mapping");
}

export function overrideMapping(userId: string, roleId: string, reason: string) {
  return request<CurrentMapping>("/profiles/" + encodeURIComponent(userId) + "/override", {
    method: "POST",
    body: JSON.stringify({ roleId, reason, overriddenBy: "ui-admin" })
  });
}

export function resetMapping(userId: string) {
  return request<CurrentMapping>("/profiles/" + encodeURIComponent(userId) + "/reset", {
    method: "POST"
  });
}
