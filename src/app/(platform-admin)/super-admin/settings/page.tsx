import { PageHeader, EmptyState } from "@/components/feedback/States";

export default function SuperAdminSettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Platform Settings"
        description="No platform settings API. Operator env lives on auth-service (PLATFORM_ADMIN_*)."
      />
      <EmptyState
        title="Nothing to configure here"
        description="Use Organizations to suspend tenants. Billing remains paused for MVP."
      />
    </div>
  );
}
