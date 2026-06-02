import { mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { workArchitectureRoles } from "../data/work-architecture.js";
import { sampleProfiles } from "../data/sample-profiles.js";
import { buildApp } from "../app.js";
import { prisma } from "../db/prisma.js";
import { toPersistedRoleInput } from "../db/mappers.js";
import type { CurrentMapping } from "../shared/types.js";

process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") {
    process.exit(0);
  }
  throw error;
});

process.env.DATABASE_URL ??= "file:./dev.db";

function databasePathFromUrl(databaseUrl: string) {
  const filePath = databaseUrl.replace(/^file:/, "");
  return isAbsolute(filePath) ? filePath : resolve("prisma", filePath);
}

function applyMigration() {
  const databasePath = databasePathFromUrl(process.env.DATABASE_URL ?? "file:./dev.db");
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  const sql = readFileSync(join("prisma", "migrations", "20260602000000_init", "migration.sql"), "utf8");
  database.exec(sql);
  database.close();
}

async function seedRoles() {
  for (const role of workArchitectureRoles) {
    await prisma.role.upsert({
      where: { roleId: role.roleId },
      update: toPersistedRoleInput(role),
      create: toPersistedRoleInput(role)
    });
  }
}

async function resetDemoState() {
  await prisma.roleOverride.deleteMany();
  await prisma.roleInference.deleteMany();
  await prisma.userProfile.deleteMany();
}

function printMapping(mapping: CurrentMapping) {
  const selected = mapping.selectedRole?.roleName ?? "No role selected";
  const inference = mapping.latestInference;
  console.log(`${mapping.userId}: ${selected} [source=${mapping.source}]`);
  if (inference) {
    console.log(`  status=${inference.status} confidence=${inference.confidence}`);
    console.log(`  explanation=${inference.explanation}`);
    if (inference.alternatives.length > 0) {
      console.log(
        `  alternatives=${inference.alternatives
          .slice(0, 2)
          .map((candidate) => `${candidate.roleName} (${candidate.confidence})`)
          .join(", ")}`
      );
    }
  }
  if (mapping.activeOverride) {
    console.log(`  override=${mapping.activeOverride.role.roleName}; reason=${mapping.activeOverride.reason}`);
  }
}

async function main() {
  applyMigration();
  await seedRoles();
  await resetDemoState();

  const app = buildApp({ logger: false });

  console.log("\n== Role Inference Service Demo ==");
  console.log(`Seeded ${workArchitectureRoles.length} roles.`);

  console.log("\n== Ingest sample profiles ==");
  for (const profile of sampleProfiles) {
    const response = await app.inject({ method: "POST", url: "/profiles", payload: profile });
    printMapping(response.json<CurrentMapping>());
  }

  console.log("\n== Hard cases ==");
  for (const userId of ["usr_006", "usr_007", "usr_008"]) {
    const response = await app.inject({ method: "GET", url: `/profiles/${userId}/mapping` });
    printMapping(response.json<CurrentMapping>());
  }

  console.log("\n== Override usr_007 ==");
  const overrideResponse = await app.inject({
    method: "POST",
    url: "/profiles/usr_007/override",
    payload: {
      roleId: "role_005",
      reason: "Admin reviewed Priya as an individual contributor.",
      overriddenBy: "demo-admin"
    }
  });
  printMapping(overrideResponse.json<CurrentMapping>());

  console.log("\n== Update profile and manually infer while override remains pinned ==");
  const priya = sampleProfiles.find((profile) => profile.userId === "usr_007");
  if (!priya) {
    throw new Error("Missing usr_007 sample profile");
  }
  await app.inject({
    method: "POST",
    url: "/profiles",
    payload: {
      ...priya,
      title: "Platform Engineer II",
      department: "Infrastructure",
      skills: ["Kubernetes", "Terraform"]
    }
  });
  const manualInferenceResponse = await app.inject({ method: "POST", url: "/profiles/usr_007/infer" });
  printMapping(manualInferenceResponse.json<CurrentMapping>());

  console.log("\n== Reset usr_007 back to inferred mode ==");
  const resetResponse = await app.inject({ method: "POST", url: "/profiles/usr_007/reset" });
  printMapping(resetResponse.json<CurrentMapping>());

  await app.close();
  await prisma.$disconnect();
}

await main();
