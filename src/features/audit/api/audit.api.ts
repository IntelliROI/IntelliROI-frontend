/**
 * Audit list HTTP is not implemented (gateway writes rows; no GET).
 * UI uses empty-state pages. Do not call these from features.
 */
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
    throw new Error("GET /audit-logs is not implemented");
  },
  async listPlatform(): Promise<AuditEntry[]> {
    throw new Error("GET /platform/audit-logs is not implemented");
  },
};
