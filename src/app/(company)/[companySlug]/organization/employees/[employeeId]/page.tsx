"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";

export default function EmployeeDetailPage({
  params,
}: {
  params: { companySlug: string; employeeId: string };
}) {
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  const roi = useQuery({
    queryKey: ["company", params.companySlug, "roi", "employee", params.employeeId],
    queryFn: () => roiApi.employee(params.employeeId),
  });

  const employee = employees.data?.find((e) => e.uuid === params.employeeId);

  if (employees.isLoading || roi.isLoading) {
    return <LoadingBlock className="h-64" />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Employee"
        title={employee?.name ?? params.employeeId}
        description={`${employee?.department ?? ""} · ${employee?.team ?? ""}`}
      />
      <Mosaic cols={4}>
        <KpiTile label="Requests" value={employee?.requests ?? 0} format="number" />
        <KpiTile label="Spend" value={roi.data?.total_spend ?? 0} format="currency" />
        <KpiTile label="Time saved" value={`${roi.data?.time_saved_hours ?? 0}h`} />
        <KpiTile label="ROI" value={roi.data?.roi_pct ?? 0} format="percent" accent />
      </Mosaic>
    </div>
  );
}
