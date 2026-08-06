"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { useChatStore } from "@/stores/chat-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { queryKeys } from "@/lib/api/query-keys";

type Message = { id: string; role: "user" | "assistant"; content: string };

export function AiWorkspace({
  companySlug,
  conversationId,
}: {
  companySlug: string;
  conversationId?: string;
}) {
  const queryClient = useQueryClient();
  const { draft, setDraft, appendStreamingBuffer, clearStreaming } =
    useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState(conversationId);

  const conversations = useQuery({
    queryKey: queryKeys.company.conversations(companySlug),
    queryFn: () => aiGatewayApi.listConversations(),
  });

  const conversation = useQuery({
    queryKey: queryKeys.company.conversation(companySlug, activeId ?? ""),
    queryFn: () => aiGatewayApi.getConversation(activeId!),
    enabled: Boolean(activeId),
  });

  const displayMessages: Message[] =
    messages.length > 0
      ? messages
      : ((conversation.data?.messages as Message[] | undefined) ?? []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    const prompt = draft.trim();
    setDraft("");
    setBusy(true);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: prompt },
    ]);

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    clearStreaming();

    try {
      const res = await aiGatewayApi.chat({
        provider,
        model,
        prompt,
        conversation_uuid: activeId || "",
      });
      setActiveId(res.conversation_uuid);

      // Pipeline 1: simulate token streaming into chat buffer (never blocks on ROI)
      const chunks = res.content.match(/.{1,12}/g) ?? [res.content];
      let assembled = "";
      for (const chunk of chunks) {
        assembled += chunk;
        appendStreamingBuffer(chunk);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assembled } : m,
          ),
        );
        await new Promise((r) => setTimeout(r, 18));
      }
      clearStreaming();

      queryClient.invalidateQueries({
        queryKey: queryKeys.company.conversations(companySlug),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[560px] gap-px bg-hairline">
      <aside className="hidden w-72 flex-col bg-ink md:flex">
        <div className="border-b border-hairline p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Pipeline 1
          </p>
          <h2 className="mt-2 text-sm font-medium text-text-primary">
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.isLoading ? (
            <LoadingBlock className="h-24" />
          ) : (
            <ul className="space-y-1">
              {(conversations.data ?? []).map((c) => (
                <li key={c.uuid}>
                  <Link
                    href={`/${companySlug}/ai-workspace/${c.uuid}`}
                    className={cn(
                      "block border px-3 py-2 transition-colors",
                      activeId === c.uuid
                        ? "border-accent/40 bg-accent/10"
                        : "border-transparent hover:border-hairline",
                    )}
                  >
                    <p className="truncate text-sm text-text-primary">{c.title}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">
                      {c.model}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-ink">
        <div className="border-b border-hairline px-4 py-4 md:px-6">
          <PageHeader
            eyebrow="AI Gateway"
            title="Workspace"
            description="Real-time chat through IntelliROI — cost & ROI land asynchronously in Pipeline 2."
          />
          <div className="mt-[-1rem] flex flex-wrap gap-3">
            <Link
              href={`/${companySlug}/ai-workspace/templates`}
              className="border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
            >
              Templates
            </Link>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="border border-hairline bg-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-text-primary"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border border-hairline bg-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-text-primary"
            >
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="claude-sonnet-4-20250514">claude-sonnet-4</option>
            </select>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-6">
          {displayMessages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  Ready
                </p>
                <p className="mt-3 text-lg font-medium text-text-primary">
                  Ask anything. Every token is metered.
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Responses stream from the gateway. ROI calculations never block this pane.
                </p>
              </div>
            </div>
          )}
          {displayMessages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-3xl border border-hairline px-4 py-3",
                m.role === "user" ? "ml-auto bg-surface/40" : "bg-ink",
              )}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                {m.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {m.content}
              </p>
            </div>
          ))}
          {busy && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent animate-pulse">
              Gateway responding…
            </p>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="border-t border-hairline p-4 md:p-6"
        >
          <div className="flex gap-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Prompt the enterprise gateway…"
              className="min-h-[72px] flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            <Button type="submit" disabled={busy || !draft.trim()} className="self-end">
              <Send className="h-4 w-4" strokeWidth={1.5} />
              Send
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
