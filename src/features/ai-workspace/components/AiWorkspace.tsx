"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { ApiError } from "@/lib/api/client";
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
import { useConfiguredProviders } from "@/features/organization/hooks/useOrganizationQueries";

const SUGGESTIONS = [
  "Draft an API design for Invoice Builder with auth middleware",
  "Explain our Estimated ROI formula for a CEO one-pager",
  "Write SQL to roll up AI cost by department and team",
  "Refactor this auth flow for clearer error handling",
];

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
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState(conversationId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const stopStreamRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const providerAutoSelectedRef = useRef(false);

  const catalog = useQuery({
    queryKey: queryKeys.company.providers(companySlug),
    queryFn: () => aiGatewayApi.listProviders(),
  });

  const configuredProviders = useConfiguredProviders(companySlug);
  const configuredProviderNames = useMemo(
    () =>
      new Set((configuredProviders.data ?? []).map((c) => c.provider)),
    [configuredProviders.data],
  );

  const providerOptions = (catalog.data ?? []).map((p) => ({
    id: p.name,
    label: p.display_name || p.name,
    models: p.models.map((m) => ({ id: m, label: m })),
    configured: configuredProviderNames.has(p.name),
  }));

  const conversations = useQuery({
    queryKey: queryKeys.company.conversations(companySlug),
    queryFn: () => aiGatewayApi.listConversations(),
  });

  const pinnedIds = (conversations.data ?? [])
    .filter((c) => c.pinned)
    .map((c) => c.uuid);

  async function togglePin(uuid: string) {
    const current = conversations.data?.find((c) => c.uuid === uuid);
    try {
      await aiGatewayApi.updateConversation(uuid, {
        pinned: !current?.pinned,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.conversations(companySlug),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update pin");
    }
  }

  async function renameConversation(uuid: string, title: string) {
    try {
      await aiGatewayApi.updateConversation(uuid, { title });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.conversations(companySlug),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename");
    }
  }

  async function deleteConversation(uuid: string) {
    try {
      await aiGatewayApi.deleteConversation(uuid);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.conversations(companySlug),
      });
      if (activeId === uuid) {
        setMessages([]);
        setActiveId(undefined);
        router.push(`/${companySlug}/ai-workspace`);
      }
      toast.success("Chat deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

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

  // Auto-select once: prefer a provider the company has actually configured
  // a key for, so we never silently pick an unconfigured provider (which
  // only surfaces as a PROVIDER_NOT_CONFIGURED error on send). Wait for the
  // configured-providers query to settle before picking, and never override
  // a provider the user picked manually.
  useEffect(() => {
    if (providerAutoSelectedRef.current) return;
    if (!catalog.data || catalog.data.length === 0) return;
    if (configuredProviders.isLoading) return;
    const preferred =
      catalog.data.find((p) => configuredProviderNames.has(p.name)) ??
      catalog.data[0];
    if (!preferred) return;
    providerAutoSelectedRef.current = true;
    setProvider(preferred.name);
    setModel(preferred.models[0] ?? "");
  }, [catalog.data, configuredProviders.isLoading, configuredProviderNames]);

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

  const displayMessages: ChatMessageView[] = useMemo(
    () =>
      messages.length > 0
        ? messages
        : ((conversation.data?.messages as ChatMessageView[] | undefined) ??
          []),
    [messages, conversation.data?.messages],
  );

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
        m.isStreaming
          ? { ...m, isStreaming: false, thinking: false, stopped: true }
          : m,
      ),
    );
    clearStreaming();
  }, [clearStreaming]);

  const send = useCallback(
    async (promptOverride?: string) => {
      const prompt = (promptOverride ?? draft).trim();
      if (!prompt || busy) return;
      if (!projectId || !taskId) {
        toast.error(
          "Select a project and task so this request can roll up to Estimated ROI",
        );
        return;
      }
      if (!provider || !model) {
        toast.error("Select a provider and model");
        return;
      }

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
        {
          id: assistantId,
          role: "assistant",
          content: "",
          isStreaming: true,
          thinking: true,
        },
      ]);
      clearStreaming();

      try {
        // Gateway waits for the full provider response (no token streaming yet);
        // this call resolves only once OpenAI/Anthropic has finished.
        const res = await aiGatewayApi.chat(
          {
            provider,
            model,
            prompt,
            conversation_uuid: activeId || undefined,
            project_id: Number(projectId),
            task_category_id: Number(taskId),
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

        // Full reply is in hand — type it out ChatGPT-style (word chunks,
        // faster than real token streaming since there's nothing left to wait for).
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, thinking: false } : m,
          ),
        );

        const words = res.content.match(/\S+\s*|\s+/g) ?? [res.content];
        const TARGET_MS = 1400;
        const perWordDelay = Math.min(30, Math.max(10, TARGET_MS / Math.max(words.length, 1)));

        let assembled = "";
        for (const word of words) {
          if (stopStreamRef.current || controller.signal.aborted) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: assembled || m.content,
                      isStreaming: false,
                      thinking: false,
                      stopped: true,
                    }
                  : m,
              ),
            );
            return;
          }
          assembled += word;
          appendStreamingBuffer(word);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: assembled, isStreaming: true }
                : m,
            ),
          );
          // Punctuation / line breaks get a slightly longer beat, like natural typing.
          const beat = /[.!?\n]\s*$/.test(word) ? perWordDelay * 2.2 : perWordDelay;
          await new Promise((r) => setTimeout(r, beat));
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
        const message =
          err instanceof ApiError && err.code === "POLICY_DENIED"
            ? "This request is blocked by an AI policy (provider, model, or daily token cap)."
            : err instanceof ApiError && err.code === "PROVIDER_NOT_CONFIGURED"
              ? "This provider has no company API key. Ask an owner to add one under AI Providers."
              : err instanceof ApiError && err.code === "INTERNAL_ERROR"
                // Surface the backend's own message (e.g. "failed to decrypt
                // provider key" / "provider chat failed" / "failed to persist
                // chat outcome") instead of a bare "Request failed" so the
                // real cause is visible instead of a generic 500.
                ? `Gateway error: ${err.message || "internal server error"}`
                : err instanceof Error
                  ? err.message
                  : "Request failed";
        toast.error(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content || message,
                  isStreaming: false,
                  thinking: false,
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

  const activeProvider = providerOptions.find((p) => p.id === provider);
  const modelLabel = `${activeProvider?.label ?? provider} · ${
    activeProvider?.models.find((m) => m.id === model)?.label ?? model
  }`;

  const empty = displayMessages.length === 0;
  const noProviderConfigured =
    !configuredProviders.isLoading && configuredProviderNames.size === 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 w-full bg-ink">
      <ChatSidebar
        companySlug={companySlug}
        conversations={conversations.data ?? []}
        loading={conversations.isLoading}
        activeId={activeId}
        pinnedIds={pinnedIds}
        onTogglePin={togglePin}
        onRename={renameConversation}
        onDelete={deleteConversation}
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

        {noProviderConfigured && (
          <div className="mx-3 mb-2 rounded-[12px] border border-warning/30 bg-warning/5 px-4 py-2.5 text-[12.5px] text-text-secondary md:mx-6">
            No AI provider has a company API key yet, so any send will fail.{" "}
            <Link
              href={`/${companySlug}/ai-providers`}
              className="font-medium text-text-primary underline underline-offset-2"
            >
              Add one under AI Providers
            </Link>
            .
          </div>
        )}

        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSubmit={() => send()}
          onStop={stop}
          busy={busy}
          companySlug={companySlug}
          providers={providerOptions}
          provider={provider}
          model={model}
          onProviderChange={(p) => {
            providerAutoSelectedRef.current = true;
            setProvider(p);
            const next = providerOptions.find((row) => row.id === p);
            setModel(next?.models[0]?.id ?? model);
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
