import { AiWorkspace } from "@/features/ai-workspace/components/AiWorkspace";

export default function AiWorkspacePage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <AiWorkspace companySlug={params.companySlug} />;
}
