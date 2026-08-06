"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { toast } from "sonner";

export default function DepartmentsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Departments"
        description="Structural units that own AI budgets and benchmarks."
        actions={
          <Can resource="departments" action="create">
            <Button
              size="sm"
              onClick={async () => {
                await organizationApi.createDepartment({
                  department_name: `New Dept ${Date.now() % 1000}`,
                });
                toast.success("Department created");
                departments.refetch();
              }}
            >
              Add department
            </Button>
          </Can>
        }
      />
      {departments.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Department" },
            { key: "people", label: "People", align: "right" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "ROI", align: "right" },
            { key: "action", label: "" },
          ]}
          rows={(departments.data ?? []).map((d) => ({
            name: d.department_name,
            people: d.employee_count,
            spend: formatCurrency(d.monthly_spend, "USD", true),
            roi: <span className="text-accent">{d.roi_pct}%</span>,
            action: (
              <Link
                href={`/${params.companySlug}/organization/departments/${d.id}`}
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
