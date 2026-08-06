import {
  Activity,
  Building2,
  ChartColumn,
  CircuitBoard,
  ClipboardList,
  Coins,
  Bell,
  FileText,
  Flag,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
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
};

const platformNav: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/super-admin/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    id: "companies",
    label: "Companies",
    href: "/super-admin/companies",
    icon: Building2,
    resource: "companies",
    action: "view",
  },
  {
    id: "providers",
    label: "AI Providers",
    href: "/super-admin/providers",
    icon: CircuitBoard,
    resource: "providers_global",
    action: "view",
  },
  {
    id: "analytics",
    label: "Platform Analytics",
    href: "/super-admin/platform-analytics",
    icon: ChartColumn,
    resource: "analytics",
    action: "view",
  },
  {
    id: "health",
    label: "System Health",
    href: "/super-admin/system-health",
    icon: Activity,
    resource: "system_health",
    action: "view",
  },
  {
    id: "flags",
    label: "Feature Flags",
    href: "/super-admin/feature-flags",
    icon: Flag,
    resource: "feature_flags",
    action: "view",
  },
  {
    id: "audit",
    label: "Audit Logs",
    href: "/super-admin/audit-logs",
    icon: Shield,
    resource: "audit",
    action: "view",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
    resource: "settings",
    action: "view",
  },
];

export function getPlatformNav(role: Role): NavItem[] {
  return platformNav.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.resource && item.action) return can(role, item.resource, item.action);
    return true;
  });
}

export function getCompanyNav(role: Role, companySlug: string): NavItem[] {
  const base = `/${companySlug}`;
  const items: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: `${base}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      id: "departments",
      label: "Departments",
      href: `${base}/organization/departments`,
      icon: Building2,
      resource: "departments",
      action: "view",
    },
    {
      id: "teams",
      label: "Teams",
      href: `${base}/organization/teams`,
      icon: Users,
      resource: "teams",
      action: "view",
    },
    {
      id: "employees",
      label: "Employees",
      href: `${base}/organization/employees`,
      icon: Users,
      resource: "employees",
      action: "view",
    },
    {
      id: "projects",
      label: "Projects",
      href: `${base}/organization/projects`,
      icon: FolderKanban,
      resource: "projects",
      action: "view",
    },
    {
      id: "providers",
      label: "AI Providers",
      href: `${base}/ai-providers`,
      icon: CircuitBoard,
      resource: "providers_company",
      action: "view",
    },
    {
      id: "workspace",
      label: "AI Workspace",
      href: `${base}/ai-workspace`,
      icon: MessageSquare,
      resource: "workspace",
      action: "use",
    },
    {
      id: "notifications",
      label: "Notifications",
      href: `${base}/notifications`,
      icon: Bell,
      resource: "notifications",
      action: "view",
    },
    {
      id: "usage",
      label: "Usage",
      href: `${base}/usage`,
      icon: Activity,
      resource: "usage",
      action: "view",
    },
    {
      id: "budgets",
      label: "Budgets",
      href: `${base}/budgets`,
      icon: Wallet,
      resource: "budgets",
      action: "view",
    },
    {
      id: "business-context",
      label: "Business Context",
      href: `${base}/business-context/task-benchmarks`,
      icon: ClipboardList,
      resource: "benchmarks",
      action: "view",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: `${base}/analytics`,
      icon: ChartColumn,
      resource: "analytics",
      action: "view",
    },
    {
      id: "roi",
      label: "ROI",
      href: `${base}/roi`,
      icon: Coins,
      resource: "roi",
      action: "view",
    },
    {
      id: "reports",
      label: "Reports",
      href: `${base}/reports`,
      icon: FileText,
      resource: "reports",
      action: "view",
    },
    {
      id: "my-workspace",
      label: "My Workspace",
      href: `${base}/my-workspace`,
      icon: Sparkles,
      roles: [ROLES.EMPLOYEE],
    },
    {
      id: "settings",
      label: "Settings",
      href: `${base}/settings/company`,
      icon: Settings,
      resource: "settings",
      action: "view",
    },
    {
      id: "audit",
      label: "Audit Logs",
      href: `${base}/settings/audit-logs`,
      icon: Shield,
      resource: "audit",
      action: "view",
    },
  ];

  return items.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.id === "my-workspace" && role !== ROLES.EMPLOYEE) return false;
    if (item.resource && item.action) return can(role, item.resource, item.action);
    return true;
  });
}
