import { TenantAuditLog } from "@/features/audit/components/AuditLog";

export default function CompanyAuditLogsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <TenantAuditLog companySlug={params.companySlug} />;
}
