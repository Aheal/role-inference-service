import { z } from "zod";

export const ssoProfileSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1),
  title: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  managerTitle: z.string().nullable().optional(),
  businessUnit: z.string().nullable().optional(),
  groups: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export const roleSchema = z.object({
  roleId: z.string().min(1),
  roleName: z.string().min(1),
  department: z.string().min(1),
  jobFamily: z.string().min(1),
  seniority: z.string().min(1),
  skills: z.array(z.string()),
  keywords: z.array(z.string()),
  roleDatasetVersion: z.string().min(1)
});

export const overrideRequestSchema = z.object({
  roleId: z.string().min(1),
  reason: z.string().min(1),
  overriddenBy: z.string().min(1).default("admin")
});

export type SsoProfileInput = z.infer<typeof ssoProfileSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type OverrideRequestInput = z.infer<typeof overrideRequestSchema>;

