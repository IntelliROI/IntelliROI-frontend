"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel, LiveDot } from "@/components/ui/panel";
import { platformApi } from "@/features/system-config/api/platform.api";

export default function SystemHealthPage() {
  const health = useQuery({
    queryKey: ["platform", "gateway-health"],
    queryFn: () => platformApi.gatewayHealth(),
    refetchInterval: 30_000,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Ops"
        title="System Health"
        description="Public api-gateway liveness and readiness. Per-service /healthz is not proxied."
      />
      {health.isLoading ? (
        <LoadingBlock className="h-32" />
      ) : (
        <Mosaic cols={2}>
          <Panel className="border-0 bg-ink p-6">
            <LiveDot label={health.data?.live ? "Live" : "Down"} />
            <p className="mt-4 font-mono text-sm text-text-primary">GET /healthz</p>
            <p className="mt-2 text-xs text-text-secondary">
              {health.data?.detail ?? "—"}
            </p>
          </Panel>
          <Panel className="border-0 bg-ink p-6">
            <LiveDot label={health.data?.ready ? "Ready" : "Not ready"} />
            <p className="mt-4 font-mono text-sm text-text-primary">GET /readyz</p>
            <p className="mt-2 text-xs text-text-secondary">
              Redis + Postgres on the gateway
            </p>
          </Panel>
        </Mosaic>
      )}
    </div>
  );
}
