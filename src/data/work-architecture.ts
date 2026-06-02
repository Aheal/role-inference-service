import type { Role } from "../shared/types.js";

export const ROLE_DATASET_VERSION = "assignment-sample-v1";

export const workArchitectureRoles: Role[] = [
  {
    roleId: "role_001",
    roleName: "Senior Data Analyst",
    department: "Data",
    jobFamily: "Analytics",
    seniority: "Senior",
    skills: ["SQL", "Python", "Dashboarding", "Stakeholder Communication"],
    keywords: ["analytics", "bi", "reporting", "insights", "tableau", "looker"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_002",
    roleName: "Data Analyst",
    department: "Data",
    jobFamily: "Analytics",
    seniority: "Mid",
    skills: ["SQL", "Excel", "Reporting"],
    keywords: ["analytics", "reporting", "data", "metrics"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_003",
    roleName: "Product Manager",
    department: "Product",
    jobFamily: "Product",
    seniority: "Mid",
    skills: ["Roadmapping", "Stakeholder Management", "Product Discovery"],
    keywords: ["product", "roadmap", "customer", "strategy", "discovery"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_004",
    roleName: "Senior Product Manager",
    department: "Product",
    jobFamily: "Product",
    seniority: "Senior",
    skills: ["Roadmapping", "Strategy", "Stakeholder Management", "User Research"],
    keywords: ["product", "strategy", "roadmap", "prioritization", "discovery"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_005",
    roleName: "Software Engineer",
    department: "Engineering",
    jobFamily: "Engineering",
    seniority: "Mid",
    skills: ["TypeScript", "APIs", "Testing"],
    keywords: ["backend", "frontend", "platform", "services", "engineering"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_006",
    roleName: "Platform Engineer",
    department: "Engineering",
    jobFamily: "Infrastructure",
    seniority: "Mid",
    skills: ["Kubernetes", "Terraform", "AWS", "CI/CD"],
    keywords: ["infrastructure", "devops", "platform", "cloud", "kubernetes"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_007",
    roleName: "Customer Success Manager",
    department: "Customer Success",
    jobFamily: "Customer Success",
    seniority: "Mid",
    skills: ["Account Management", "Stakeholder Communication", "Escalation Handling"],
    keywords: ["customer", "renewal", "adoption", "success", "csm"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_008",
    roleName: "Sales Operations Analyst",
    department: "Sales",
    jobFamily: "Operations",
    seniority: "Mid",
    skills: ["CRM", "Forecasting", "Reporting"],
    keywords: ["salesforce", "pipeline", "forecast", "quota", "crm"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_009",
    roleName: "Revenue Operations Manager",
    department: "Revenue Operations",
    jobFamily: "Operations",
    seniority: "Senior",
    skills: ["CRM Analytics", "Forecasting", "Pipeline Management", "Cross-functional Alignment"],
    keywords: ["revops", "revenue", "operations", "salesforce", "pipeline", "forecast"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  },
  {
    roleId: "role_010",
    roleName: "Engineering Manager",
    department: "Engineering",
    jobFamily: "Engineering",
    seniority: "Manager",
    skills: ["Technical Leadership", "Hiring", "Delivery Management"],
    keywords: ["engineering manager", "team lead", "delivery", "people management"],
    roleDatasetVersion: ROLE_DATASET_VERSION
  }
];

