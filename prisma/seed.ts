import { prisma } from "../src/db/prisma.js";
import { toPersistedRoleInput } from "../src/db/mappers.js";
import { workArchitectureRoles } from "../src/data/work-architecture.js";

for (const role of workArchitectureRoles) {
  const persistedRole = toPersistedRoleInput(role);

  await prisma.role.upsert({
    where: { roleId: role.roleId },
    update: persistedRole,
    create: persistedRole
  });
}

console.log(`Seeded ${workArchitectureRoles.length} roles.`);

await prisma.$disconnect();
