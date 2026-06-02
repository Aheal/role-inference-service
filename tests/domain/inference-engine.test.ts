import { describe, expect, it } from "vitest";
import { sampleProfiles } from "../../src/data/sample-profiles.js";
import { workArchitectureRoles } from "../../src/data/work-architecture.js";
import { inferRole } from "../../src/domain/inference-engine.js";

function profile(userId: string) {
  const found = sampleProfiles.find((candidate) => candidate.userId === userId);
  if (!found) {
    throw new Error(`Missing sample profile ${userId}`);
  }
  return found;
}

describe("inferRole", () => {
  it("maps usr_001 to Senior Data Analyst with high confidence", () => {
    const result = inferRole(profile("usr_001"), workArchitectureRoles);

    expect(result.inferredRoleId).toBe("role_001");
    expect(result.status).toBe("inferred");
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    expect(result.signals.some((signal) => signal.includes("Title"))).toBe(true);
  });

  it("maps usr_002 to Platform Engineer with high confidence", () => {
    const result = inferRole(profile("usr_002"), workArchitectureRoles);

    expect(result.inferredRoleId).toBe("role_006");
    expect(result.status).toBe("inferred");
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it("marks usr_006 as needs_review", () => {
    const result = inferRole(profile("usr_006"), workArchitectureRoles);

    expect(result.status).toBe("needs_review");
    expect(result.confidence).toBeGreaterThan(0.24);
    expect(result.confidence).toBeLessThan(0.75);
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it("marks usr_007 as ambiguous needs_review", () => {
    const result = inferRole(profile("usr_007"), workArchitectureRoles);

    expect(result.status).toBe("needs_review");
    expect(result.confidence).toBeLessThan(0.75);
    expect(result.alternatives.length).toBeGreaterThan(0);
    expect(result.explanation).toContain("needs review");
  });

  it("marks usr_008 as insufficient_data", () => {
    const result = inferRole(profile("usr_008"), workArchitectureRoles);

    expect(result.status).toBe("insufficient_data");
    expect(result.inferredRoleId).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.signals).toEqual([]);
  });
});
