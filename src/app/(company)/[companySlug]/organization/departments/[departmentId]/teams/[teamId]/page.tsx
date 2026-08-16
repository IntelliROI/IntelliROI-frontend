import { TeamDashboard } from "@/features/organization/components/TeamDashboard";

export default function TeamDetailPage({
  params,
}: {
  params: { companySlug: string; departmentId: string; teamId: string };
}) {
  return (
    <TeamDashboard
      companySlug={params.companySlug}
      departmentId={Number(params.departmentId)}
      teamId={Number(params.teamId)}
    />
  );
}
