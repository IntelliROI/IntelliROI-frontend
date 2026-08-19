/**
 * Entity-scoped CSV templates — columns mirror the Add forms (dropdown IDs
 * become name/email lookups since a spreadsheet can't carry numeric IDs).
 * Kept in sync with the backend parsers in
 * organization-service/internal/usecase/import_parse.go.
 */

export const DEPARTMENTS_IMPORT_TEMPLATE = `department_name,department_code,description,manager_email
Engineering,ENG,Builds and ships the product,priya.rao@example.com
Sales,SLS,Revenue and customer growth,
`;

export const TEAMS_IMPORT_TEMPLATE = `team_name,team_code,department_name,description,lead_email
Platform,PLT,Engineering,Core infrastructure,arun.kumar@example.com
Growth,GRW,Sales,,
`;

export const EMPLOYEES_IMPORT_TEMPLATE = `email,first_name,last_name,role,employee_code,phone,designation,department_name,team_name,manager_email,joining_date
sara.jain@example.com,Sara,Jain,employee,EMP-103,,Software Engineer,Engineering,Platform,arun.kumar@example.com,2024-03-10
arun.kumar@example.com,Arun,Kumar,team_lead,EMP-102,,Team Lead,Engineering,Platform,,2024-02-01
`;

export const PROJECTS_IMPORT_TEMPLATE = `project_name,description,department_name,team_name,project_members
Gateway Rollout,Ship the AI gateway,Engineering,Platform,arun.kumar@example.com;sara.jain@example.com
`;
