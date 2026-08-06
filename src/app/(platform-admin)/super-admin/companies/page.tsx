"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { platformApi } from "@/features/system-config/api/platform.api";

export default function CompaniesPage() {
  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Tenants"
        title="Companies"
        description="All tenants on the IntelliROI platform."
      />
      {companies.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Company" },
            { key: "plan", label: "Plan" },
            { key: "status", label: "Status" },
            { key: "industry", label: "Industry" },
            { key: "action", label: "" },
          ]}
          rows={(companies.data ?? []).map((c) => ({
            name: c.name,
            plan: c.plan ?? "—",
            status: c.status,
            industry: c.industry ?? "—",
            action: (
              <Link
                href={`/super-admin/companies/${c.uuid}`}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
              >
                Open
              </Link>
            ),
          }))}
        />
      )}
    </div>
  );
}
