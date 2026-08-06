import { ScopedAnalyticsView } from "@/features/analytics/components/ScopedAnalyticsView";

export default function EmployeeAnalyticsPage({
  params,
}: {
  params: { companySlug: string; employeeId: string };
}) {
  return (
    <ScopedAnalyticsView
      companySlug={params.companySlug}
      scope="employee"
      scopeId={params.employeeId}
      title={`Employee Analytics · ${params.employeeId}`}
    />
  );
}
