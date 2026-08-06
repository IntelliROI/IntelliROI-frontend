import { delay } from "@/lib/mocks/data";
import { useMocks } from "@/lib/api/client";

export type AuditEntry = {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  scope: "platform" | "tenant";
};

const TENANT_LOGS: AuditEntry[] = [
  {
    id: "a1",
    time: "2026-08-06 16:20",
    actor: "ceo@acme.test",
    action: "budget.update",
    target: "Engineering",
    scope: "tenant",
  },
  {
    id: "a2",
    time: "2026-08-06 12:05",
    actor: "dept@acme.test",
    action: "benchmark.approve",
    target: "Code Generation",
    scope: "tenant",
  },
  {
    id: "a3",
    time: "2026-08-05 18:44",
    actor: "ceo@acme.test",
    action: "provider.key_added",
    target: "openai",
    scope: "tenant",
  },
];

const PLATFORM_LOGS: AuditEntry[] = [
  {
    id: "p1",
    time: "2026-08-06 14:02",
    actor: "nova@intelliroi.com",
    action: "company.suspend",
    target: "Peak Finance",
    scope: "platform",
  },
  {
    id: "p2",
    time: "2026-08-06 11:18",
    actor: "system",
    action: "pricing.sync",
    target: "openai",
    scope: "platform",
  },
];

export const auditApi = {
  async listTenant(): Promise<AuditEntry[]> {
    if (useMocks) return delay(TENANT_LOGS);
    return delay(TENANT_LOGS);
  },
  async listPlatform(): Promise<AuditEntry[]> {
    if (useMocks) return delay(PLATFORM_LOGS);
    return delay(PLATFORM_LOGS);
  },
};
