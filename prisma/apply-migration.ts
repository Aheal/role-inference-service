import { mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

function databasePathFromUrl(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Only SQLite file URLs are supported. Received: ${databaseUrl}`);
  }

  const filePath = databaseUrl.slice("file:".length);
  if (isAbsolute(filePath)) {
    return filePath;
  }

  return resolve("prisma", filePath);
}

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const databasePath = databasePathFromUrl(databaseUrl);
const migrationPath = join("prisma", "migrations", "20260602000000_init", "migration.sql");
const migrationSql = readFileSync(migrationPath, "utf8");

mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec(migrationSql);
database.close();

console.log(`Applied migration to ${databasePath}.`);
