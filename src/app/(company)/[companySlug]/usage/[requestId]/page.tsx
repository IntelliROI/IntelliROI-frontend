import { UsageRequestDetail } from "@/features/usage/components/UsageRequestDetail";

export default function UsageRequestPage({
  params,
}: {
  params: { companySlug: string; requestId: string };
}) {
  return (
    <UsageRequestDetail
      companySlug={params.companySlug}
      requestId={params.requestId}
    />
  );
}
