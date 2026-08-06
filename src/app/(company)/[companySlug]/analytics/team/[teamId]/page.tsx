import { ScopedAnalyticsView } from "@/features/analytics/components/ScopedAnalyticsView";

export default function TeamAnalyticsPage({
  params,
}: {
  params: { companySlug: string; teamId: string };
}) {
  return (
    <ScopedAnalyticsView
      companySlug={params.companySlug}
      scope="team"
      scopeId={Number(params.teamId)}
      title={`Team Analytics · #${params.teamId}`}
    />
  );
}
