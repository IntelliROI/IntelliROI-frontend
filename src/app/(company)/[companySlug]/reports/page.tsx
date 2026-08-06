import { PageHeader, EmptyState } from "@/components/feedback/States";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Exports"
        title="Reports"
        description="Saved executive packs and scheduled digests."
      />
      <EmptyState
        title="No saved reports yet"
        description="Generate ROI and analytics packs once Pipeline 2 aggregates stabilize."
      />
    </div>
  );
}
