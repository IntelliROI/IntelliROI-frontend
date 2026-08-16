"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { organizationApi } from "@/features/organization/api/organization.api";
import { ResendInviteButton } from "@/features/organization/components/ResendInviteButton";
import { roiApi } from "@/features/roi/api/roi.api";

export default function EmployeeDetailPage({
  params,
}: {
  params: { companySlug: string; employeeId: string };
}) {
  const employeeQ = useQuery({
    queryKey: ["company", params.companySlug, "employee", params.employeeId],
    queryFn: () => organizationApi.getEmployee(params.employeeId),
  });
  const roi = useQuery({
    queryKey: [
      "company",
      params.companySlug,
      "roi",
      "employee",
      params.employeeId,
    ],
    queryFn: () => roiApi.employee(params.employeeId),
  });

  const employee = employeeQ.data;
  const invited = employee?.status === "invited";

  if (employeeQ.isLoading || (!invited && roi.isLoading)) {
    return <LoadingBlock className="h-64" />;
  }

  return (
    <div>
      <PageHeader
        eyebrow={employee?.employee_code ?? "Employee"}
        title={employee?.display_name ?? params.employeeId}
        description={
          invited
            ? `${employee.email} has not activated their account yet. Resend the invite if they never received the email.`
            : `${employee?.department_name ?? ""} · ${employee?.team_name ?? ""} · ${employee?.job_role_name ?? ""} ($${employee?.hourly_cost ?? 0}/hr)`
        }
        actions={
          invited && employee?.email ? (
            <ResendInviteButton
              email={employee.email}
              displayName={employee.display_name}
            />
          ) : undefined
        }
      />
      <Mosaic cols={4}>
        <KpiTile
          label="Requests"
          value={employee?.requests ?? 0}
          format="number"
        />
        <KpiTile
          label="Spend"
          value={roi.data?.total_spend ?? employee?.spend ?? 0}
          format="currency"
        />
        <KpiTile
          label="Time saved"
          value={`${roi.data?.time_saved_hours ?? 0}h`}
        />
        <KpiTile
          label="Estimated ROI"
          value={roi.data?.roi_pct ?? employee?.roi_pct ?? 0}
          format="percent"
          accent
        />
      </Mosaic>
    </div>
  );
}
