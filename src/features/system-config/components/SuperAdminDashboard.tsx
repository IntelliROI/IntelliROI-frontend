"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic, Panel } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { platformApi } from "@/features/system-config/api/platform.api";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function SuperAdminDashboard() {
  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });
  const metrics = useQuery({
    queryKey: ["platform", "metrics"],
    queryFn: () => platformApi.metrics(),
  });
  const providers = useQuery({
    queryKey: ["platform", "providers"],
    queryFn: () => aiGatewayApi.listProviders(),
  });

  if (companies.isLoading || metrics.isLoading) return <LoadingBlock className="h-96" />;

  const tenants = companies.data ?? [];
  const m = metrics.data;
  const active = m?.active_companies ?? 0;
  const suspended = m?.suspended_companies ?? 0;
  const seats = m?.seated_users ?? 0;
  const tenantCount = m?.tenant_count ?? tenants.length;

  return (
    <div>
      <PageHeader
        eyebrow="Platform"
        title="Super Admin Control Plane"
        description="Customer tenants on this IntelliROI instance. Revenue and platform-wide AI spend wait on billing."
        actions={
          <Button asChild size="sm">
            <Link href="/super-admin/companies">
              Manage companies
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Button>
        }
      />

      <Mosaic cols={4}>
        <KpiTile label="Customer companies" value={tenantCount} format="number" />
        <KpiTile label="Active" value={active} format="number" accent />
        <KpiTile label="Suspended" value={suspended} format="number" />
        <KpiTile label="Seated users" value={seats} format="number" hint="from tenant roster" />
      </Mosaic>

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-5">
        <Panel className="border-0 bg-ink p-6 lg:col-span-3">
          <h2 className="mb-4 font-medium text-text-primary">Tenants</h2>
          <DataTable
            columns={[
              { key: "name", label: "Company" },
              { key: "status", label: "Status" },
              { key: "users", label: "Users", align: "right" },
              { key: "action", label: "" },
            ]}
            rows={tenants.map((c) => ({
              name: c.name,
              status: (
                <span
                  className={
                    c.status === "active"
                      ? "text-accent"
                      : c.status === "trial"
                        ? "text-warning"
                        : "text-danger"
                  }
                >
                  {c.status}
                </span>
              ),
              users: c.user_count ?? "—",
              action: (
                <Link
                  href={`/super-admin/companies/${c.uuid}`}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Inspect
                </Link>
              ),
            }))}
          />
        </Panel>
        <Panel className="border-0 bg-ink p-6 lg:col-span-2">
          <h2 className="mb-3 font-medium text-text-primary">
            Seeded provider catalog
          </h2>
          <ul className="space-y-2">
            {(providers.data ?? []).map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between border border-hairline px-3 py-2"
              >
                <span className="text-sm text-text-primary">{p.display_name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
