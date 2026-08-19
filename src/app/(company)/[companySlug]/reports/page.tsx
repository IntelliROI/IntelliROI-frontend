import { PageHeader, EmptyState } from "@/components/feedback/States";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Exports"
        title="Reports"
        description="Scheduled digests and executive packs are not on the backend yet."
      />
      <EmptyState
        title="Reports API not available"
        description="Use Analytics and Estimated ROI screens for live snapshots. This nav item is hidden until a reports service exists."
      />
    </div>
  );
}
