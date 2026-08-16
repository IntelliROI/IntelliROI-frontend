"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic, Panel } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { ProviderDonut } from "@/components/charts/Charts";
import { platformApi } from "@/features/system-config/api/platform.api";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function SuperAdminDashboard() {
  const metrics = useQuery({
    queryKey: ["platform", "metrics"],
    queryFn: () => platformApi.metrics(),
  });
  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });
  const providers = useQuery({
    queryKey: ["platform", "providers"],
    queryFn: () => aiGatewayApi.listProviders(),
  });

  if (metrics.isLoading) return <LoadingBlock className="h-96" />;

  if (!metrics.data) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load platform metrics from the live service.
      </p>
    );
  }

  const m = metrics.data;

  return (
    <div>
      <PageHeader
        eyebrow="Platform"
        title="Super Admin Control Plane"
        description="Cross-tenant health, revenue, and provider reliability for running IntelliROI."
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
        <KpiTile
          label="Active companies"
          value={m.active_companies}
          format="number"
          delta={8.2}
          hint={`+${m.new_signups_month} this month`}
        />
        <KpiTile label="MRR" value={m.mrr} format="currency" delta={5.1} accent />
        <KpiTile
          label="AI spend processed"
          value={m.platform_ai_spend}
          format="currency"
          hint="platform-wide"
        />
        <KpiTile
          label="Active employees"
          value={m.active_employees}
          format="number"
        />
      </Mosaic>

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-5">
        <Panel className="border-0 bg-ink p-6 lg:col-span-3">
          <h2 className="mb-4 font-medium text-text-primary">Tenant health</h2>
          <DataTable
            columns={[
              { key: "name", label: "Company" },
              { key: "plan", label: "Plan" },
              { key: "status", label: "Status" },
              { key: "action", label: "" },
            ]}
            rows={(companies.data ?? []).map((c) => ({
              name: c.name,
              plan: c.plan ?? "—",
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
          <h2 className="mb-4 font-medium text-text-primary">Plan mix</h2>
          <ProviderDonut
            data={(m.plan_distribution ?? []).map((p) => ({
              name: p.plan,
              value: p.count,
            }))}
          />
          <h2 className="mb-3 mt-6 font-medium text-text-primary">
            Provider health
          </h2>
          <ul className="space-y-2">
            {(providers.data ?? []).map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between border border-hairline px-3 py-2"
              >
                <span className="text-sm text-text-primary">{p.display_name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                  <span
                    className={
                      p.status === "healthy" ? "text-accent" : "text-warning"
                    }
                  >
                    {p.status}
                  </span>
                  {" · "}
                  {p.latency_ms}ms
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
