import { EmployeeDashboard } from "@/features/organization/components/EmployeeDashboard";

export default function MyWorkspacePage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <EmployeeDashboard companySlug={params.companySlug} />;
}
