import { UsageTable } from "@/features/usage/components/UsageTable";

export default function UsagePage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <UsageTable companySlug={params.companySlug} />;
}
