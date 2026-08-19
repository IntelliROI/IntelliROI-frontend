import { ScopedAnalyticsView } from "@/features/analytics/components/ScopedAnalyticsView";

export default function AnalyticsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  return (
    <ScopedAnalyticsView
      companySlug={params.companySlug}
      scope="company"
      title="Company Analytics"
    />
  );
}
