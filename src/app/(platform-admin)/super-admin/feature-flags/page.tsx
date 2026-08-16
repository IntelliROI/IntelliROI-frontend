import { PageHeader } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";

const FLAGS = [
  { key: "roi.recommendations.v2", enabled: true },
  { key: "workspace.streaming", enabled: true },
  { key: "integrations.jira", enabled: false },
  { key: "billing.seat_enforcement", enabled: true },
];

export default function FeatureFlagsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Config"
        title="Feature Flags"
        description="Platform toggles for gradual rollout."
      />
      <div className="space-y-px bg-hairline">
        {FLAGS.map((f) => (
          <Panel key={f.key} className="flex items-center justify-between border-0 bg-ink px-6 py-4">
            <span className="font-mono text-sm text-text-primary">{f.key}</span>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.2em] ${f.enabled ? "text-accent" : "text-text-secondary"}`}
            >
              {f.enabled ? "On" : "Off"}
            </span>
          </Panel>
        ))}
      </div>
    </div>
  );
}
