import { PromptTemplatesLibrary } from "@/features/ai-workspace/components/PromptTemplatesLibrary";

export default function TemplatesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <PromptTemplatesLibrary companySlug={params.companySlug} />;
}
