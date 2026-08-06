"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";

export default function EmployeesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Employees"
        description="Directory with spend and personal ROI signals."
      />
      {employees.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "department", label: "Department" },
            { key: "team", label: "Team" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "ROI", align: "right" },
            { key: "action", label: "" },
          ]}
          rows={(employees.data ?? []).map((e) => ({
            name: e.name,
            department: e.department,
            team: e.team,
            spend: formatCurrency(e.spend, "USD", true),
            roi: <span className="text-accent">{e.roi_pct}%</span>,
            action: (
              <Link
                href={`/${params.companySlug}/organization/employees/${e.uuid}`}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
              >
                Profile
              </Link>
            ),
          }))}
        />
      )}
    </div>
  );
}
