import { PageHeader } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";

export default function SuperAdminSettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Platform Settings"
        description="Global configuration for IntelliROI operators."
      />
      <Panel className="p-6">
        <p className="text-sm text-text-secondary">
          Internal API keys, default formula versions, and support tooling will
          live here. Align with billing + system-config services.
        </p>
      </Panel>
    </div>
  );
}
