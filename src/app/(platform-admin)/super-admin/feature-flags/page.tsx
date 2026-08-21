import { PageHeader, EmptyState } from "@/components/feedback/States";

export default function FeatureFlagsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Config"
        title="Feature Flags"
        description="There is no feature-flag service. This page is not in the sidebar."
      />
      <EmptyState
        title="No flags API"
        description="Do not treat hardcoded toggles as live configuration."
      />
    </div>
  );
}
