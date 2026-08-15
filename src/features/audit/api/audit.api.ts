import { apiRequest } from "@/lib/api/client";

export type AuditEntry = {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  scope: "platform" | "tenant";
};

export const auditApi = {
  async listTenant(): Promise<AuditEntry[]> {
    return apiRequest<AuditEntry[]>("auth", "/audit-logs");
  },
  async listPlatform(): Promise<AuditEntry[]> {
    return apiRequest<AuditEntry[]>("auth", "/platform/audit-logs");
  },
};
