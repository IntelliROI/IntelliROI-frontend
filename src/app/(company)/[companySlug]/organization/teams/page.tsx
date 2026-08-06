"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";

export default function TeamsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const teams = useQuery({
    queryKey: ["company", params.companySlug, "teams"],
    queryFn: () => organizationApi.listTeams(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Teams"
        description="Team-level AI usage and ownership."
      />
      {teams.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Team" },
            { key: "dept", label: "Department ID", align: "right" },
            { key: "members", label: "Members", align: "right" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "ROI", align: "right" },
            { key: "action", label: "" },
          ]}
          rows={(teams.data ?? []).map((t) => ({
            name: t.team_name,
            dept: t.department_id,
            members: t.member_count,
            spend: formatCurrency(t.monthly_spend, "USD", true),
            roi: <span className="text-accent">{t.roi_pct}%</span>,
            action: (
              <Link
                href={`/${params.companySlug}/organization/departments/${t.department_id}/teams/${t.id}`}
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
