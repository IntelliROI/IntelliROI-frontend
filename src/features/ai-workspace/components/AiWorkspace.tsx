"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { useChatStore } from "@/stores/chat-store";
import { queryKeys } from "@/lib/api/query-keys";
import {
  ChatMessageBubble,
  type ChatMessageView,
} from "@/features/ai-workspace/components/ChatMessage";
import { ChatComposer } from "@/features/ai-workspace/components/ChatComposer";
import { ChatSidebar } from "@/features/ai-workspace/components/ChatSidebar";
import { AiChatLoader, AiMark } from "@/features/ai-workspace/components/AiMark";
import { organizationApi } from "@/features/organization/api/organization.api";
import { businessContextApi } from "@/features/business-context/api/business-context.api";

const SUGGESTIONS = [
  "Draft an API design for Invoice Builder with auth middleware",
  "Explain our Estimated ROI formula for a CEO one-pager",
  "Write SQL to roll up AI cost by department and team",
  "Refactor this auth flow for clearer error handling",
];

const MODELS: Record<
  string,
  { label: string; models: { id: string; label: string }[] }
> = {
  openai: {
    label: "OpenAI",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4o", label: "GPT-4o" },
    ],
  },
  anthropic: {
    label: "Anthropic",
    models: [{ id: "claude-sonnet-4-20250514", label: "Claude Sonnet" }],
  },
  google: {
    label: "Google",
    models: [{ id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" }],
  },
};

const PROVIDERS = Object.entries(MODELS).map(([id, meta]) => ({
  id,
  label: meta.label,
  models: meta.models,
}));

function pinnedStorageKey(slug: string) {
  return `intelliroi.pinned-chats.${slug}`;
}

/**
 * OpenAI / Claude-class enterprise chat workspace.
 * Pipeline 1 only — never blocked by cost/ROI.
 */
export function AiWorkspace({
  companySlug,
  conversationId,
}: {
  companySlug: string;
  conversationId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearStreaming, appendStreamingBuffer } =
    useChatStore();

  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState(conversationId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const stopStreamRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(pinnedStorageKey(companySlug));
      if (raw) setPinnedIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, [companySlug]);

  function persistPins(next: string[]) {
    setPinnedIds(next);
    try {
      localStorage.setItem(pinnedStorageKey(companySlug), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function togglePin(uuid: string) {
    persistPins(
      pinnedIds.includes(uuid)
        ? pinnedIds.filter((id) => id !== uuid)
        : [...pinnedIds, uuid],
    );
  }

  const conversations = useQuery({
    queryKey: queryKeys.company.conversations(companySlug),
    queryFn: () => aiGatewayApi.listConversations(),
  });

  const conversation = useQuery({
    queryKey: queryKeys.company.conversation(companySlug, activeId ?? ""),
    queryFn: () => aiGatewayApi.getConversation(activeId!),
    enabled: Boolean(activeId) && messages.length === 0,
  });

  const projects = useQuery({
    queryKey: queryKeys.company.projects(companySlug),
    queryFn: () => organizationApi.listProjects(),
  });

  const tasks = useQuery({
    queryKey: ["company", companySlug, "task-categories"],
    queryFn: () => businessContextApi.listTaskCategories(),
  });

  useEffect(() => {
    setActiveId(conversationId);
    setMessages([]);
  }, [conversationId]);

  // Prefill draft from templates (?prompt=)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    if (prompt) {
      setDraft(prompt);
      router.replace(`/${companySlug}/ai-workspace`, { scroll: false });
    }
  }, [companySlug, router, setDraft]);

  const displayMessages: ChatMessageView[] =
    messages.length > 0
      ? messages
      : ((conversation.data?.messages as ChatMessageView[] | undefined) ?? []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [displayMessages, busy]);

  const stop = useCallback(() => {
    stopStreamRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false, stopped: true } : m,
      ),
    );
    clearStreaming();
  }, [clearStreaming]);

  const send = useCallback(
    async (promptOverride?: string) => {
      const prompt = (promptOverride ?? draft).trim();
      if (!prompt || busy) return;

      setDraft("");
      setBusy(true);
      stopStreamRef.current = false;
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessageView = {
        id: `u-${Date.now()}`,
        role: "user",
        content: prompt,
      };
      const assistantId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "", isStreaming: true },
      ]);
      clearStreaming();

      try {
        const res = await aiGatewayApi.chat(
          {
            provider,
            model,
            prompt,
            conversation_uuid: activeId || "",
            project_id: projectId ? Number(projectId) : null,
            task_category_id: taskId ? Number(taskId) : null,
          },
          { signal: controller.signal },
        );

        if (stopStreamRef.current) return;

        setActiveId(res.conversation_uuid);
        if (!conversationId || conversationId !== res.conversation_uuid) {
          router.replace(
            `/${companySlug}/ai-workspace/${res.conversation_uuid}`,
          );
        }

        const chunks = res.content.match(/.{1,10}/g) ?? [res.content];
        let assembled = "";
        for (const chunk of chunks) {
          if (stopStreamRef.current || controller.signal.aborted) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: assembled || m.content,
                      isStreaming: false,
                      stopped: true,
                    }
                  : m,
              ),
            );
            return;
          }
          assembled += chunk;
          appendStreamingBuffer(chunk);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: assembled, isStreaming: true }
                : m,
            ),
          );
          await new Promise((r) => setTimeout(r, 12));
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: assembled, isStreaming: false }
              : m,
          ),
        );
        clearStreaming();
        queryClient.invalidateQueries({
          queryKey: queryKeys.company.conversations(companySlug),
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    m.content ||
                    "Something went wrong reaching the gateway. Try again.",
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [
      draft,
      busy,
      setDraft,
      clearStreaming,
      provider,
      model,
      activeId,
      projectId,
      taskId,
      conversationId,
      router,
      companySlug,
      appendStreamingBuffer,
      queryClient,
    ],
  );

  function newChat() {
    stop();
    setMessages([]);
    setActiveId(undefined);
    setDraft("");
    router.push(`/${companySlug}/ai-workspace`);
  }

  const modelLabel = `${MODELS[provider]?.label ?? provider} · ${
    MODELS[provider]?.models.find((m) => m.id === model)?.label ?? model
  }`;

  const empty = displayMessages.length === 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 w-full bg-ink">
      <ChatSidebar
        companySlug={companySlug}
        conversations={conversations.data ?? []}
        loading={conversations.isLoading}
        activeId={activeId}
        pinnedIds={pinnedIds}
        onTogglePin={togglePin}
        onNewChat={newChat}
        expanded={sidebarOpen}
        onExpandedChange={setSidebarOpen}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversation.isLoading && activeId && messages.length === 0 ? (
            <AiChatLoader label="Loading conversation…" />
          ) : empty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 pb-8 pt-12">
              <div className="mb-4">
                <AiMark size="lg" />
              </div>
              <h1 className="text-center text-[1.75rem] font-medium tracking-tight text-text-primary md:text-[2rem]">
                How can I help you today?
              </h1>
              <p className="mt-2 max-w-md text-center text-[13px] text-text-secondary">
                Enterprise chat through IntelliROI Gateway. Use + to pick model,
                project, and task attribution.
              </p>
              <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-[16px] border border-hairline bg-surface/25 px-4 py-3.5 text-left text-[13px] leading-snug text-text-secondary transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-6 pt-2">
              {displayMessages.map((m) => (
                <ChatMessageBubble
                  key={m.id}
                  message={m}
                  modelLabel={m.role === "assistant" ? modelLabel : undefined}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSubmit={() => send()}
          onStop={stop}
          busy={busy}
          companySlug={companySlug}
          providers={PROVIDERS}
          provider={provider}
          model={model}
          onProviderChange={(p) => {
            setProvider(p);
            setModel(MODELS[p]?.models[0]?.id ?? model);
          }}
          onModelChange={setModel}
          projects={(projects.data ?? []).map((p) => ({
            id: p.id,
            name: p.project_name,
          }))}
          tasks={(tasks.data ?? []).map((t) => ({
            id: t.id,
            name: t.name,
          }))}
          projectId={projectId}
          taskId={taskId}
          onProjectChange={setProjectId}
          onTaskChange={setTaskId}
        />
      </section>
    </div>
  );
}
