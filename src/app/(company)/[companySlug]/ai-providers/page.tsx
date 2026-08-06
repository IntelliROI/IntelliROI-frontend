import { CompanyProvidersPanel } from "@/features/ai-providers/components/CompanyProvidersPanel";

export default function CompanyProvidersPage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <CompanyProvidersPanel companySlug={params.companySlug} />;
}
