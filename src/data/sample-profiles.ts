import type { SsoProfile } from "../shared/types.js";

export const sampleProfiles: SsoProfile[] = [
  {
    userId: "usr_001",
    displayName: "Sarah Chen",
    title: "Sr BI Analyst",
    department: "Data & Insights",
    managerTitle: "Director of Analytics",
    groups: ["tableau-users", "data-team", "all-staff"],
    skills: ["SQL", "Looker", "Python"],
    location: "New York"
  },
  {
    userId: "usr_002",
    displayName: "David Kim",
    title: "Platform Engineer II",
    department: "Infrastructure",
    managerTitle: "VP Engineering",
    groups: ["aws-admins", "engineering", "oncall"],
    skills: ["Kubernetes", "Node.js", "Terraform"],
    location: "Toronto"
  },
  {
    userId: "usr_003",
    displayName: "Emily Rodriguez",
    title: "Customer Outcomes Lead",
    department: "Customer Experience",
    managerTitle: "Head of Customer Success",
    groups: ["gainsight-users", "cs-team"],
    skills: ["QBRs", "Customer Escalations", "Renewals"],
    location: "Chicago"
  },
  {
    userId: "usr_004",
    displayName: "Michael Patel",
    title: "Product Strategy Manager",
    department: "Product",
    managerTitle: "Chief Product Officer",
    groups: ["jira-admins", "product-team"],
    skills: ["Roadmapping", "User Research", "Prioritization"],
    location: "London"
  },
  {
    userId: "usr_005",
    displayName: "Lisa Thompson",
    title: "Revenue Operations Specialist",
    department: "Revenue Operations",
    managerTitle: "Director of Sales Operations",
    groups: ["salesforce-admins"],
    skills: ["Forecasting", "CRM Analytics", "Pipeline Reporting"],
    location: "Austin"
  },
  {
    userId: "usr_006",
    displayName: "James Wu",
    title: "Analyst",
    department: "Operations",
    managerTitle: "Operations Manager",
    groups: ["all-staff"],
    skills: [],
    location: "Singapore",
    notes: "Transferred from Sales team 3 months ago"
  },
  {
    userId: "usr_007",
    displayName: "Priya Nair",
    title: "Lead",
    department: "Engineering",
    managerTitle: "CTO",
    groups: ["engineering", "all-staff"],
    skills: ["Python", "SQL", "Machine Learning"],
    location: "Bangalore"
  },
  {
    userId: "usr_008",
    displayName: "Tom Bergstrom",
    title: null,
    department: null,
    managerTitle: null,
    groups: ["contractors"],
    skills: [],
    location: "Stockholm"
  }
];

