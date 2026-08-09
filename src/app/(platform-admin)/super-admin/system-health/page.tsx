import { PageHeader } from "@/components/feedback/States";
import { Mosaic, Panel, LiveDot } from "@/components/ui/panel";

const SERVICES = [
  "auth :8081",
  "organization :8082",
  "business-context :8083",
  "ai-gateway :8084",
  "usage-cost :8085",
  "roi-engine :8086",
  "analytics :8087",
  "notification :8088",
  "billing :8089",
];

export default function SystemHealthPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Ops"
        title="System Health"
        description="Gateway uptime, queue depth, and service readiness."
      />
      <Mosaic cols={3}>
        {SERVICES.map((s) => (
          <Panel key={s} className="border-0 bg-ink p-6">
            <LiveDot label="Healthy" />
            <p className="mt-4 font-mono text-sm text-text-primary">{s}</p>
            <p className="mt-2 text-xs text-text-secondary">
              /healthz · /readyz
            </p>
          </Panel>
        ))}
      </Mosaic>
    </div>
  );
}
