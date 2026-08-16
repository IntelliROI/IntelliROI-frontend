import { ScopedAnalyticsView } from "@/features/analytics/components/ScopedAnalyticsView";

export default function DepartmentAnalyticsPage({
  params,
}: {
  params: { companySlug: string; departmentId: string };
}) {
  return (
    <ScopedAnalyticsView
      companySlug={params.companySlug}
      scope="department"
      scopeId={Number(params.departmentId)}
      title={`Department Analytics · #${params.departmentId}`}
    />
  );
}
