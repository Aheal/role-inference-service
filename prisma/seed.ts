import { prisma } from "../src/db/prisma.js";
import { workArchitectureRoles } from "../src/data/work-architecture.js";

for (const role of workArchitectureRoles) {
  await prisma.role.upsert({
    where: { roleId: role.roleId },
    update: {
      roleName: role.roleName,
      department: role.department,
      jobFamily: role.jobFamily,
      seniority: role.seniority,
      skills: JSON.stringify(role.skills),
      keywords: JSON.stringify(role.keywords),
      roleDatasetVersion: role.roleDatasetVersion
    },
    create: {
      roleId: role.roleId,
      roleName: role.roleName,
      department: role.department,
      jobFamily: role.jobFamily,
      seniority: role.seniority,
      skills: JSON.stringify(role.skills),
      keywords: JSON.stringify(role.keywords),
      roleDatasetVersion: role.roleDatasetVersion
    }
  });
}

console.log(`Seeded ${workArchitectureRoles.length} roles.`);

await prisma.$disconnect();
