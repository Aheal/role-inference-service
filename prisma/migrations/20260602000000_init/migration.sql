-- CreateTable
CREATE TABLE IF NOT EXISTS "Role" (
    "roleId" TEXT NOT NULL PRIMARY KEY,
    "roleName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "jobFamily" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "roleDatasetVersion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "rawPayload" TEXT NOT NULL,
    "normalizedTitle" TEXT,
    "normalizedDepartment" TEXT,
    "normalizedSkills" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RoleInference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userProfileId" TEXT NOT NULL,
    "inferredRoleId" TEXT,
    "confidence" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "signals" TEXT NOT NULL,
    "conflictSignals" TEXT NOT NULL,
    "alternatives" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "roleDatasetVersion" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "staleReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoleInference_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoleInference_inferredRoleId_fkey" FOREIGN KEY ("inferredRoleId") REFERENCES "Role" ("roleId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RoleOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userProfileId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "RoleOverride_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoleOverride_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("roleId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserProfile_externalUserId_key" ON "UserProfile"("externalUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RoleOverride_userProfileId_deletedAt_idx" ON "RoleOverride"("userProfileId", "deletedAt");
