import { AiWorkspace } from "@/features/ai-workspace/components/AiWorkspace";

export default function AiWorkspaceConversationPage({
  params,
}: {
  params: { companySlug: string; conversationId: string };
}) {
  return (
    <AiWorkspace
      companySlug={params.companySlug}
      conversationId={params.conversationId}
    />
  );
}
