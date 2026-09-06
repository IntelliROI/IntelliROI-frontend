"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, LiveDot } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import {
  mergePlatformMetrics,
  platformApi,
} from "@/features/system-config/api/platform.api";

const links = [
  {
    href: "/super-admin/companies",
    label: "Organizations",
    detail: "Suspend or reactivate customer tenants",
  },
  {
    href: "/super-admin/providers",
    label: "AI providers",
    detail: "Catalog and which tenants have keys",
  },
  {
    href: "/super-admin/system-health",
    label: "System health",
    detail: "Gateway /healthz and /readyz",
  },
  {
    href: "/super-admin/audit-logs",
    label: "Audit logs",
    detail: "Platform operator actions",
  },
];

export default function SuperAdminSettingsPage() {
  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });
  const metrics = useQuery({
    queryKey: ["platform", "metrics"],
    queryFn: () => platformApi.metrics(),
  });
  const health = useQuery({
    queryKey: ["platform", "gateway-health"],
    queryFn: () => platformApi.gatewayHealth(),
    refetchInterval: 30_000,
  });

  if (companies.isLoading) return <LoadingBlock className="h-64" />;

  const m = mergePlatformMetrics(companies.data ?? [], metrics.data);

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Platform Settings"
        description="Operator hub. There is no settings store — tenant status, keys, and health use the live platform APIs. Super Admin seed is PLATFORM_ADMIN_* on auth-service."
      />

      <Mosaic cols={4}>
        <KpiTile label="Customer companies" value={m.tenant_count} format="number" />
        <KpiTile label="Active" value={m.active_companies} format="number" accent />
        <KpiTile label="Suspended" value={m.suspended_companies} format="number" />
        <KpiTile label="Seated users" value={m.seated_users} format="number" />
      </Mosaic>

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-2">
        <Panel className="border-0 bg-ink p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
            Gateway
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <LiveDot label={health.data?.live ? "Live" : "Down"} />
            <LiveDot label={health.data?.ready ? "Ready" : "Not ready"} />
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            {health.data?.detail ?? "Checking…"}
          </p>
        </Panel>
        <Panel className="border-0 bg-ink p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
            Operator shortcuts
          </p>
          <ul className="mt-4 space-y-3">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-accent hover:text-accent/80">
                  {item.label}
                </Link>
                <p className="text-xs text-text-secondary">{item.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
