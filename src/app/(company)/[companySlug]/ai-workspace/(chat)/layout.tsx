"use client";

import { useParams } from "next/navigation";
import { AiWorkspace } from "@/features/ai-workspace/components/AiWorkspace";

/**
 * Shared shell for blank + conversation URLs. Layout stays mounted when
 * navigating between /ai-workspace and /ai-workspace/:id so message state
 * is not wiped (ChatGPT-style continuity).
 */
export default function AiWorkspaceChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{
    companySlug: string;
    conversationId?: string;
  }>();

  return (
    <>
      <AiWorkspace
        companySlug={params.companySlug}
        conversationId={params.conversationId}
      />
      {/* Pages are URL markers only — UI lives in the layout shell. */}
      <div className="hidden" aria-hidden>
        {children}
      </div>
    </>
  );
}
