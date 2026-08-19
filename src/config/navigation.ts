import {
  Activity,
  Building2,
  ChartColumn,
  CircuitBoard,
  ClipboardList,
  Coins,
  Bell,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  UploadCloud,
  Users,
  Wallet,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { type Role, ROLES } from "@/constants/roles";
import { can, type Resource, type Action } from "@/lib/rbac/role-matrix";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  resource?: Resource;
  action?: Action;
  roles?: Role[];
  /** Optional sidebar section heading */
  section?: string;
};

const platformNav: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/super-admin/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.SUPER_ADMIN],
    section: "Platform",
  },
  {
    id: "companies",
    label: "Organizations",
    href: "/super-admin/companies",
    icon: Building2,
    resource: "companies",
    action: "view",
    section: "Platform",
  },
  {
    id: "providers",
    label: "AI Providers",
    href: "/super-admin/providers",
    icon: CircuitBoard,
    resource: "providers_global",
    action: "view",
    section: "Platform",
  },
  {
    id: "analytics",
    label: "Platform Analytics",
    href: "/super-admin/platform-analytics",
    icon: ChartColumn,
    resource: "analytics",
    action: "view",
    section: "Intelligence",
  },
  {
    id: "health",
    label: "System Health",
    href: "/super-admin/system-health",
    icon: Activity,
    resource: "system_health",
    action: "view",
    section: "Intelligence",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
    resource: "settings",
    action: "view",
    section: "Ops",
  },
];

export function getPlatformNav(role: Role, permissions?: string[]): NavItem[] {
  return platformNav.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.resource && item.action) {
      return can(role, item.resource, item.action, permissions);
    }
    return true;
  });
}

/**
 * Role experiences from architecture doc — not one mega-menu filtered poorly.
 */
export function getCompanyNav(
  role: Role,
  companySlug: string,
  permissions?: string[],
): NavItem[] {
  const base = `/${companySlug}`;

  if (role === ROLES.EMPLOYEE) {
    return [
      {
        id: "workspace",
        label: "AI Workspace",
        href: `${base}/ai-workspace`,
        icon: MessageSquare,
        section: "Workspace",
      },
      {
        id: "my-workspace",
        label: "My Usage & ROI",
        href: `${base}/my-workspace`,
        icon: Sparkles,
        section: "Workspace",
      },
      {
        id: "projects",
        label: "My Projects",
        href: `${base}/organization/projects`,
        icon: FolderKanban,
        section: "Workspace",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: `${base}/notifications`,
        icon: Bell,
        section: "Account",
      },
    ];
  }

  if (role === ROLES.TEAM_LEAD) {
    return filterNav([
      {
        id: "dashboard",
        label: "Team Dashboard",
        href: `${base}/dashboard`,
        icon: LayoutDashboard,
        section: "Team",
      },
      {
        id: "employees",
        label: "Team Members",
        href: `${base}/organization/employees`,
        icon: Users,
        resource: "employees",
        action: "view",
        section: "Team",
      },
      {
        id: "projects",
        label: "Projects",
        href: `${base}/organization/projects`,
        icon: FolderKanban,
        resource: "projects",
        action: "view",
        section: "Team",
      },
      {
        id: "usage",
        label: "AI Usage",
        href: `${base}/usage`,
        icon: Activity,
        resource: "usage",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: `${base}/analytics`,
        icon: ChartColumn,
        resource: "analytics",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "roi",
        label: "Estimated ROI",
        href: `${base}/roi`,
        icon: Coins,
        resource: "roi",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "workspace",
        label: "AI Workspace",
        href: `${base}/ai-workspace`,
        icon: MessageSquare,
        resource: "workspace",
        action: "use",
        section: "Workspace",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: `${base}/notifications`,
        icon: Bell,
        resource: "notifications",
        action: "view",
        section: "Account",
      },
    ], role, permissions);
  }

  if (role === ROLES.DEPARTMENT_HEAD) {
    return filterNav([
      {
        id: "dashboard",
        label: "Dept Dashboard",
        href: `${base}/dashboard`,
        icon: LayoutDashboard,
        section: "Department",
      },
      {
        id: "teams",
        label: "Teams",
        href: `${base}/organization/teams`,
        icon: Users,
        resource: "teams",
        action: "view",
        section: "Department",
      },
      {
        id: "employees",
        label: "Employees",
        href: `${base}/organization/employees`,
        icon: UserRound,
        resource: "employees",
        action: "view",
        section: "Department",
      },
      {
        id: "projects",
        label: "Projects",
        href: `${base}/organization/projects`,
        icon: FolderKanban,
        resource: "projects",
        action: "view",
        section: "Department",
      },
      {
        id: "usage",
        label: "AI Usage",
        href: `${base}/usage`,
        icon: Activity,
        resource: "usage",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: `${base}/analytics`,
        icon: ChartColumn,
        resource: "analytics",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "roi",
        label: "Estimated ROI",
        href: `${base}/roi`,
        icon: Coins,
        resource: "roi",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "budgets",
        label: "Budgets",
        href: `${base}/budgets`,
        icon: Wallet,
        resource: "budgets",
        action: "view",
        section: "Intelligence",
      },
      {
        id: "workspace",
        label: "AI Workspace",
        href: `${base}/ai-workspace`,
        icon: MessageSquare,
        resource: "workspace",
        action: "use",
        section: "Workspace",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: `${base}/notifications`,
        icon: Bell,
        resource: "notifications",
        action: "view",
        section: "Account",
      },
    ], role, permissions);
  }

  // CEO / Company Owner — executive control center
  return filterNav([
    {
      id: "dashboard",
      label: "Executive Dashboard",
      href: `${base}/dashboard`,
      icon: LayoutDashboard,
      section: "Executive",
    },
    {
      id: "departments",
      label: "Departments",
      href: `${base}/organization/departments`,
      icon: Building2,
      resource: "departments",
      action: "view",
      section: "Organization",
    },
    {
      id: "teams",
      label: "Teams",
      href: `${base}/organization/teams`,
      icon: Users,
      resource: "teams",
      action: "view",
      section: "Organization",
    },
    {
      id: "employees",
      label: "Employees",
      href: `${base}/organization/employees`,
      icon: UserRound,
      resource: "employees",
      action: "view",
      section: "Organization",
    },
    {
      id: "job-roles",
      label: "Job Roles",
      href: `${base}/organization/job-roles`,
      icon: ClipboardList,
      resource: "job_roles",
      action: "view",
      section: "Organization",
    },
    {
      id: "projects",
      label: "Projects",
      href: `${base}/organization/projects`,
      icon: FolderKanban,
      resource: "projects",
      action: "view",
      section: "Organization",
    },
    {
      id: "bulk-import",
      label: "Bulk Import",
      href: `${base}/organization/import`,
      icon: UploadCloud,
      resource: "departments",
      action: "manage",
      section: "Organization",
    },
    {
      id: "usage",
      label: "AI Usage",
      href: `${base}/usage`,
      icon: Activity,
      resource: "usage",
      action: "view",
      section: "AI Intelligence",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: `${base}/analytics`,
      icon: ChartColumn,
      resource: "analytics",
      action: "view",
      section: "AI Intelligence",
    },
    {
      id: "roi",
      label: "Estimated ROI",
      href: `${base}/roi`,
      icon: Coins,
      resource: "roi",
      action: "view",
      section: "AI Intelligence",
    },
    {
      id: "providers",
      label: "AI Providers",
      href: `${base}/ai-providers`,
      icon: CircuitBoard,
      resource: "providers_company",
      action: "view",
      section: "AI Intelligence",
    },
    {
      id: "budgets",
      label: "Budgets",
      href: `${base}/budgets`,
      icon: Wallet,
      resource: "budgets",
      action: "view",
      section: "Governance",
    },
    {
      id: "policies",
      label: "AI Policies",
      href: `${base}/governance/policies`,
      icon: Shield,
      resource: "policies",
      action: "view",
      section: "Governance",
    },
    {
      id: "business-context",
      label: "Task Benchmarks",
      href: `${base}/business-context/task-benchmarks`,
      icon: ClipboardList,
      resource: "benchmarks",
      action: "view",
      section: "Governance",
    },
    {
      id: "recommendations",
      label: "Recommendations",
      href: `${base}/roi/recommendations`,
      icon: Sparkles,
      resource: "roi",
      action: "view",
      section: "Governance",
    },
    {
      id: "workspace",
      label: "AI Workspace",
      href: `${base}/ai-workspace`,
      icon: MessageSquare,
      resource: "workspace",
      action: "use",
      section: "Workspace",
    },
    {
      id: "notifications",
      label: "Notifications",
      href: `${base}/notifications`,
      icon: Bell,
      resource: "notifications",
      action: "view",
      section: "Account",
    },
    {
      id: "settings",
      label: "Company Settings",
      href: `${base}/settings/company`,
      icon: Settings,
      resource: "settings",
      action: "view",
      section: "Account",
    },
  ], role, permissions);
}

function filterNav(
  items: NavItem[],
  role: Role,
  permissions?: string[],
): NavItem[] {
  return items.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.resource && item.action) {
      return can(role, item.resource, item.action, permissions);
    }
    return true;
  });
}
