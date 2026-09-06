/**
 * Entity-scoped CSV templates — columns mirror the Add forms (dropdown IDs
 * become name/email lookups since a spreadsheet can't carry numeric IDs).
 *
 * Each template ships with:
 *   1. a real header row (used by the parser),
 *   2. a "# Required / Optional …" legend line, and
 *   3. one or more example rows, all prefixed with "#".
 *
 * The backend CSV parser treats lines beginning with "#" as comments and
 * skips them, so downloading a template and uploading it unchanged imports
 * *nothing* (instead of creating dummy departments / inviting fake people).
 * To use an example, copy it and remove the leading "# ".
 *
 * Kept in sync with the backend parsers in
 * organization-service/internal/usecase/import_parse.go.
 */
import type { ImportEntity } from "@/features/organization/api/organization.api";

export const DEPARTMENTS_IMPORT_TEMPLATE = `department_name,department_code,description,manager_email
# Required: department_name. Optional: department_code, description, manager_email (must be an existing user in the company).
# Delete this line and the "# " below to import the example row.
# Engineering,ENG,Builds and ships the product,priya.rao@example.com
# Sales,SLS,Revenue and customer growth,
`;

export const TEAMS_IMPORT_TEMPLATE = `team_name,team_code,department_name,description,lead_email
# Required: team_name, department_name (the department must already exist). Optional: team_code, description, lead_email (existing user).
# Delete this line and the "# " below to import the example row.
# Platform,PLT,Engineering,Core infrastructure,arun.kumar@example.com
# Growth,GRW,Sales,,
`;

export const EMPLOYEES_IMPORT_TEMPLATE = `email,first_name,last_name,role,job_role,employee_code,phone,designation,department_name,team_name,manager_email,joining_date
# Required: email, first_name, last_name. Strongly recommended: job_role (must match an existing Job Role by name — it sets the hourly cost that drives Estimated ROI; without it ROI is 0).
# "role" is the ACCESS role (employee | team_lead | department_manager; default employee). "job_role" is the COSTED job title (e.g. Software Engineer) configured under Job Roles.
# Optional: employee_code, phone, designation, department_name, team_name (both must already exist), manager_email, joining_date.
# joining_date must be YYYY-MM-DD (e.g. 2024-03-10). Keep it as TEXT in Excel so it is not auto-reformatted.
# Delete this line and the "# " below to import the example row.
# sara.jain@example.com,Sara,Jain,employee,Software Engineer,EMP-103,,Software Engineer,Engineering,Platform,arun.kumar@example.com,2024-03-10
`;

export const PROJECTS_IMPORT_TEMPLATE = `project_name,description,department_name,team_name,project_members
# Required: project_name. Optional: description, department_name, team_name (if team_name is set, department_name is required), project_members (existing user emails separated by ";").
# Delete this line and the "# " below to import the example row.
# Gateway Rollout,Ship the AI gateway,Engineering,Platform,arun.kumar@example.com;sara.jain@example.com
`;

/** One documented column for the in-modal field guide. */
export type ImportFieldGuide = {
  name: string;
  required: boolean;
  /** Optional but strongly advised (e.g. job_role — drives Estimated ROI). */
  recommended?: boolean;
  note?: string;
};

/**
 * Per-entity column reference shown inside the import modal so users know
 * exactly which columns are required vs optional (and the date format).
 */
export const IMPORT_FIELD_GUIDES: Record<ImportEntity, ImportFieldGuide[]> = {
  departments: [
    { name: "department_name", required: true },
    { name: "department_code", required: false, note: "e.g. ENG" },
    { name: "description", required: false },
    { name: "manager_email", required: false, note: "must be an existing user" },
  ],
  teams: [
    { name: "team_name", required: true },
    { name: "department_name", required: true, note: "must already exist" },
    { name: "team_code", required: false },
    { name: "description", required: false },
    { name: "lead_email", required: false, note: "must be an existing user" },
  ],
  people: [
    { name: "email", required: true },
    { name: "first_name", required: true },
    { name: "last_name", required: true },
    { name: "role", required: false, note: "ACCESS role: employee | team_lead | department_manager" },
    {
      name: "job_role",
      required: false,
      recommended: true,
      note: "existing Job Role name — sets hourly cost for Estimated ROI (without it, ROI is 0)",
    },
    { name: "employee_code", required: false },
    { name: "phone", required: false },
    { name: "designation", required: false },
    { name: "department_name", required: false, note: "must already exist" },
    { name: "team_name", required: false, note: "must already exist" },
    { name: "manager_email", required: false, note: "existing user" },
    { name: "joining_date", required: false, note: "YYYY-MM-DD" },
  ],
  projects: [
    { name: "project_name", required: true },
    { name: "description", required: false },
    { name: "department_name", required: false, note: "required if team is set" },
    { name: "team_name", required: false, note: "must already exist" },
    { name: "project_members", required: false, note: 'emails separated by ";"' },
  ],
};
