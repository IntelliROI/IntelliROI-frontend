/**
 * In-memory org store for mocks — mutates so onboarding/create forms feel real.
 */
import { ROLES } from "@/constants/roles";
import type {
  CompanySettings,
  Department,
  Employee,
  JobRole,
  Project,
  Team,
} from "@/features/organization/types";

export const mockCompanySettings: CompanySettings = {
  company_id: 1,
  working_hours_per_day: 8,
  working_days_per_month: 22,
  default_currency: "USD",
  timezone: "Asia/Kolkata",
  date_format: "YYYY-MM-DD",
  fiscal_year_start: "01-01",
};

export let mockJobRoles: JobRole[] = [
  {
    id: 101,
    company_id: 1,
    role_name: "Frontend Developer",
    hourly_cost: 30,
    currency: "USD",
    status: "active",
  },
  {
    id: 102,
    company_id: 1,
    role_name: "Backend Developer",
    hourly_cost: 35,
    currency: "USD",
    status: "active",
  },
  {
    id: 103,
    company_id: 1,
    role_name: "QA Engineer",
    hourly_cost: 25,
    currency: "USD",
    status: "active",
  },
  {
    id: 104,
    company_id: 1,
    role_name: "Sales Executive",
    hourly_cost: 22,
    currency: "USD",
    status: "active",
  },
];

export let mockDepartmentsStore: Department[] = [
  {
    id: 1,
    company_id: 1,
    department_name: "Engineering",
    department_code: "ENG",
    description: "Software development and engineering",
    manager_employee_id: 25,
    manager_user_uuid: "usr-dept-001",
    status: "active",
    employee_count: 42,
    monthly_spend: 18420,
    roi_pct: 312,
    budget_limit: 25000,
  },
  {
    id: 2,
    company_id: 1,
    department_name: "Sales",
    department_code: "SAL",
    description: "Revenue and account teams",
    manager_employee_id: null,
    manager_user_uuid: null,
    status: "active",
    employee_count: 28,
    monthly_spend: 9200,
    roi_pct: 248,
    budget_limit: 12000,
  },
  {
    id: 3,
    company_id: 1,
    department_name: "Marketing",
    department_code: "MKT",
    status: "active",
    employee_count: 18,
    monthly_spend: 6400,
    roi_pct: 189,
    budget_limit: 8000,
  },
  {
    id: 4,
    company_id: 1,
    department_name: "Customer Success",
    department_code: "CS",
    status: "active",
    employee_count: 22,
    monthly_spend: 5100,
    roi_pct: 221,
    budget_limit: 7000,
  },
];

export let mockTeamsStore: Team[] = [
  {
    id: 1,
    company_id: 1,
    department_id: 1,
    team_name: "Platform",
    team_code: "PLT",
    lead_user_uuid: "usr-lead-001",
    team_lead_employee_id: 41,
    status: "active",
    member_count: 8,
    monthly_spend: 6200,
    roi_pct: 340,
  },
  {
    id: 2,
    company_id: 1,
    department_id: 1,
    team_name: "Frontend",
    team_code: "FE",
    status: "active",
    member_count: 6,
    monthly_spend: 4100,
    roi_pct: 290,
  },
  {
    id: 3,
    company_id: 1,
    department_id: 1,
    team_name: "QA",
    team_code: "QA",
    status: "active",
    member_count: 5,
    monthly_spend: 2800,
    roi_pct: 260,
  },
  {
    id: 4,
    company_id: 1,
    department_id: 2,
    team_name: "Enterprise Sales",
    team_code: "ES",
    status: "active",
    member_count: 10,
    monthly_spend: 5200,
    roi_pct: 255,
  },
];

export let mockProjectsStore: Project[] = [
  {
    id: 1,
    company_id: 1,
    project_name: "Invoice Builder",
    project_code: "INV",
    department_id: 1,
    team_id: 2,
    status: "active",
  },
  {
    id: 2,
    company_id: 1,
    project_name: "ROI Console",
    project_code: "ROI",
    department_id: 1,
    team_id: 1,
    status: "active",
  },
  {
    id: 3,
    company_id: 1,
    project_name: "Outbound Copilot",
    project_code: "OUT",
    department_id: 2,
    team_id: 4,
    status: "active",
  },
];

export let mockEmployeesStore: Employee[] = [
  {
    id: 41,
    uuid: "usr-emp-001",
    company_id: 1,
    user_id: "usr-emp-001",
    employee_code: "EMP-0041",
    first_name: "Riley",
    last_name: "Maker",
    display_name: "Riley Maker",
    email: "emp@acme.test",
    department_id: 1,
    team_id: 1,
    job_role_id: 101,
    manager_employee_id: 25,
    designation: "Software Engineer",
    joining_date: "2025-01-15",
    employment_status: "active",
    app_role: ROLES.EMPLOYEE,
    status: "active",
    department_name: "Engineering",
    team_name: "Platform",
    job_role_name: "Frontend Developer",
    hourly_cost: 30,
    spend: 420,
    roi_pct: 380,
    requests: 146,
  },
  {
    id: 25,
    uuid: "usr-dept-001",
    company_id: 1,
    user_id: "usr-dept-001",
    employee_code: "EMP-0025",
    first_name: "Jordan",
    last_name: "Head",
    display_name: "Jordan Head",
    email: "dept@acme.test",
    department_id: 1,
    team_id: null,
    job_role_id: 102,
    designation: "Engineering Manager",
    employment_status: "active",
    app_role: ROLES.DEPARTMENT_HEAD,
    status: "active",
    department_name: "Engineering",
    team_name: "—",
    job_role_name: "Backend Developer",
    hourly_cost: 35,
    spend: 210,
    roi_pct: 290,
    requests: 64,
  },
  {
    id: 42,
    uuid: "usr-emp-002",
    company_id: 1,
    employee_code: "EMP-0042",
    first_name: "Casey",
    last_name: "Chen",
    display_name: "Casey Chen",
    email: "casey@acme.test",
    department_id: 1,
    team_id: 2,
    job_role_id: 101,
    employment_status: "active",
    app_role: ROLES.EMPLOYEE,
    status: "active",
    department_name: "Engineering",
    team_name: "Frontend",
    job_role_name: "Frontend Developer",
    hourly_cost: 30,
    spend: 380,
    roi_pct: 310,
    requests: 121,
  },
  {
    id: 43,
    uuid: "usr-emp-003",
    company_id: 1,
    employee_code: "EMP-0043",
    first_name: "Morgan",
    last_name: "Lee",
    display_name: "Morgan Lee",
    email: "morgan@acme.test",
    department_id: 2,
    team_id: 4,
    job_role_id: 104,
    employment_status: "active",
    app_role: ROLES.EMPLOYEE,
    status: "active",
    department_name: "Sales",
    team_name: "Enterprise Sales",
    job_role_name: "Sales Executive",
    hourly_cost: 22,
    spend: 510,
    roi_pct: 265,
    requests: 98,
  },
];

let nextId = 1000;

export function nextMockId() {
  nextId += 1;
  return nextId;
}

export function resolveDepartmentName(id: number) {
  return mockDepartmentsStore.find((d) => d.id === id)?.department_name ?? "—";
}

export function resolveTeamName(id: number | null | undefined) {
  if (id == null) return "—";
  return mockTeamsStore.find((t) => t.id === id)?.team_name ?? "—";
}

export function resolveJobRole(id: number) {
  return mockJobRoles.find((r) => r.id === id);
}
