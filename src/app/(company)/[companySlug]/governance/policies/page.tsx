import { PoliciesGovernance } from "@/features/ai-gateway/components/PoliciesGovernance";

export default function PoliciesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <PoliciesGovernance companySlug={params.companySlug} />;
}
