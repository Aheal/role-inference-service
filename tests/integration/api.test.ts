import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sampleProfiles } from "../../src/data/sample-profiles.js";
import { workArchitectureRoles } from "../../src/data/work-architecture.js";
import { toPersistedRoleInput } from "../../src/db/mappers.js";

const dbPath = join(process.cwd(), "prisma", "test.db");
process.env.DATABASE_URL = `file:${dbPath}`;

const { prisma } = await import("../../src/db/prisma.js");
const { buildApp } = await import("../../src/app.js");

function migrateTestDb() {
  rmSync(dbPath, { force: true });
  mkdirSync(dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);
  const sql = readFileSync(join("prisma", "migrations", "20260602000000_init", "migration.sql"), "utf8");
  database.exec(sql);
  database.close();
}

async function seedRoles() {
  for (const role of workArchitectureRoles) {
    await prisma.role.create({ data: toPersistedRoleInput(role) });
  }
}

function profile(userId: string) {
  const found = sampleProfiles.find((candidate) => candidate.userId === userId);
  if (!found) {
    throw new Error(`Missing sample profile ${userId}`);
  }
  return found;
}

beforeAll(async () => {
  migrateTestDb();
  await seedRoles();
});

beforeEach(async () => {
  await prisma.roleOverride.deleteMany();
  await prisma.roleInference.deleteMany();
  await prisma.userProfile.deleteMany();
});

describe("profile mapping API", () => {
  it("lists seeded roles", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/roles" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(10);
    expect(response.json()[0].skills).toEqual(expect.any(Array));
  });

  it("ingests a profile, runs inference, and returns current mapping", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/profiles",
      payload: profile("usr_001")
    });
    await app.close();

    const mapping = response.json();
    expect(response.statusCode).toBe(200);
    expect(mapping.source).toBe("inferred");
    expect(mapping.selectedRole.roleId).toBe("role_001");
    expect(mapping.latestInference.status).toBe("inferred");
  });

  it("re-runs manual inference without changing mapping shape", async () => {
    const app = buildApp();
    await app.inject({ method: "POST", url: "/profiles", payload: profile("usr_002") });
    const response = await app.inject({ method: "POST", url: "/profiles/usr_002/infer" });
    await app.close();

    const mapping = response.json();
    expect(response.statusCode).toBe(200);
    expect(mapping.source).toBe("inferred");
    expect(mapping.selectedRole.roleId).toBe("role_006");
    expect(mapping.latestInference.inferredRoleId).toBe("role_006");
  });

  it("returns 404 for a missing mapping", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/profiles/missing/mapping" });
    await app.close();

    expect(response.statusCode).toBe(404);
  });
});
