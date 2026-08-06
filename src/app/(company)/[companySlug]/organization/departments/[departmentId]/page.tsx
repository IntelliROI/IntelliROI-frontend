import { DepartmentDashboard } from "@/features/organization/components/DepartmentDashboard";

export default function DepartmentDetailPage({
  params,
}: {
  params: { companySlug: string; departmentId: string };
}) {
  return (
    <DepartmentDashboard
      companySlug={params.companySlug}
      departmentId={Number(params.departmentId)}
    />
  );
}
