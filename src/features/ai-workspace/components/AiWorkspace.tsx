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
import { Can } from "@/lib/rbac/Can";

const SUGGESTIONS = [
  "Draft an API design for Invoice Builder with auth middleware",
  "Explain our Estimated ROI formula for a CEO one-pager",
  "Write SQL to roll up AI cost by department and team",
  "Refactor this auth flow for clearer error handling",
];

/**
 * OpenAI / Claude-class enterprise chat workspace.
 * Mounted once from (chat)/layout so URL changes do not remount this tree.
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
  const {
    draft,
    setDraft,
    clearStreaming,
    projectId,
    taskId,
    provider,
    model,
    setProjectId,
    setTaskId,
    setProvider,
    setModel,
    setActiveConversationId,
  } = useChatStore();

  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>(conversationId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  /** When true, refresh thread from API (cache may already paint instantly). */
  const [needsHydrate, setNeedsHydrate] = useState(Boolean(conversationId));

  const abortRef = useRef<AbortController | null>(null);
  const stopStreamRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const providerAutoSelectedRef = useRef(false);
  const prevUrlIdRef = useRef<string | undefined>(conversationId);
  /** In-memory thread cache so sidebar switches paint immediately. */
  const threadCacheRef = useRef<Map<string, ChatMessageView[]>>(new Map());
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  function cacheThread(uuid: string | undefined, msgs: ChatMessageView[]) {
    if (!uuid || msgs.length === 0) return;
    threadCacheRef.current.set(
      uuid,
      msgs.map((m) => ({
        ...m,
        isStreaming: false,
        thinking: false,
      })),
    );
  }

  function messagesFromDetail(
    detail: { messages?: { id: string; role: string; content: string }[] },
  ): ChatMessageView[] {
    return (detail.messages ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: m.id,
        role: m.role as ChatMessageView["role"],
        content: m.content,
      }));
  }

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
        setActiveConversationId(null);
        setNeedsHydrate(false);
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
    enabled: Boolean(activeId) && needsHydrate,
    staleTime: 30_000,
  });

  // Apply server history; prefer cache paint first so switches feel instant.
  useEffect(() => {
    if (!needsHydrate || !conversation.data?.messages) return;
    if (conversation.data.uuid && conversation.data.uuid !== activeId) return;
    const next = messagesFromDetail(conversation.data);
    cacheThread(activeId, next);
    setMessages(next);
    setNeedsHydrate(false);
  }, [needsHydrate, conversation.data, activeId]);

  const projects = useQuery({
    queryKey: queryKeys.company.projects(companySlug),
    queryFn: () => organizationApi.listProjects(),
  });

  const tasks = useQuery({
    queryKey: ["company", companySlug, "task-categories"],
    queryFn: () => businessContextApi.listTaskCategories(),
  });

  const prefetchConversation = useCallback(
    (uuid: string) => {
      if (!uuid || uuid === activeId) return;
      void queryClient.prefetchQuery({
        queryKey: queryKeys.company.conversation(companySlug, uuid),
        queryFn: () => aiGatewayApi.getConversation(uuid),
        staleTime: 30_000,
      });
    },
    [activeId, companySlug, queryClient],
  );

  // Sync URL → active thread without wiping in-progress messages.
  useEffect(() => {
    const prev = prevUrlIdRef.current;
    prevUrlIdRef.current = conversationId;

    if (conversationId === prev) return;

    // Soft replace after first reply: same thread we already have locally.
    if (conversationId && conversationId === activeId && messagesRef.current.length > 0) {
      cacheThread(conversationId, messagesRef.current);
      setActiveConversationId(conversationId);
      return;
    }

    // Leaving a thread — keep its messages for instant return.
    if (prev) {
      cacheThread(prev, messagesRef.current);
    }

    // New Chat
    if (!conversationId) {
      if (!busy) {
        setActiveId(undefined);
        setActiveConversationId(null);
        setMessages([]);
        setNeedsHydrate(false);
      }
      return;
    }

    // Sidebar / deep-link: paint from memory or React Query cache immediately.
    setActiveId(conversationId);
    setActiveConversationId(conversationId);

    const mem = threadCacheRef.current.get(conversationId);
    const cached = queryClient.getQueryData(
      queryKeys.company.conversation(companySlug, conversationId),
    ) as { messages?: { id: string; role: string; content: string }[] } | undefined;
    if (mem && mem.length > 0) {
      setMessages(mem);
      setNeedsHydrate(true); // background refresh
    } else if (cached?.messages?.length) {
      const next = messagesFromDetail(cached);
      cacheThread(conversationId, next);
      setMessages(next);
      setNeedsHydrate(true);
    } else {
      setMessages([]);
      setNeedsHydrate(true);
    }
  }, [
    conversationId,
    activeId,
    busy,
    companySlug,
    queryClient,
    setActiveConversationId,
  ]);

  useEffect(() => {
    if (providerAutoSelectedRef.current) return;
    if (provider && model) {
      providerAutoSelectedRef.current = true;
      return;
    }
    if (!catalog.data || catalog.data.length === 0) return;
    if (configuredProviders.isLoading) return;
    const preferred =
      catalog.data.find((p) => configuredProviderNames.has(p.name)) ??
      catalog.data[0];
    if (!preferred) return;
    providerAutoSelectedRef.current = true;
    if (!provider) setProvider(preferred.name);
    if (!model) setModel(preferred.models[0] ?? "");
  }, [
    catalog.data,
    configuredProviders.isLoading,
    configuredProviderNames,
    provider,
    model,
    setProvider,
    setModel,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    if (prompt) {
      setDraft(prompt);
      router.replace(`/${companySlug}/ai-workspace`, { scroll: false });
    }
  }, [companySlug, router, setDraft]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

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
          "Select a project and task once (via +) so requests roll up to Estimated ROI — they stick for follow-ups",
        );
        return;
      }
      const projectNum = Number(projectId);
      const taskNum = Number(taskId);
      if (!Number.isFinite(projectNum) || projectNum <= 0) {
        toast.error("Select a valid project");
        return;
      }
      if (!Number.isFinite(taskNum) || taskNum <= 0) {
        toast.error("Select a valid task category");
        return;
      }
      if (!provider || !model) {
        toast.error("Select a provider and model");
        return;
      }

      // Prefer live activeId / URL. Only use the persisted store id when this
      // thread already has messages — never continue a stale uuid on New chat.
      const threadId =
        activeId ||
        conversationId ||
        (messagesRef.current.length > 0
          ? useChatStore.getState().activeConversationId
          : null) ||
        undefined;

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
        const res = await aiGatewayApi.chat(
          {
            provider,
            model,
            prompt,
            conversation_uuid: threadId || undefined,
            project_id: projectNum,
            task_category_id: taskNum,
          },
          { signal: controller.signal },
        );

        if (stopStreamRef.current) return;

        const threadUuid = res.conversation_uuid;
        if (!threadUuid) {
          throw new Error("Chat succeeded but returned no conversation id");
        }

        setActiveId(threadUuid);
        setActiveConversationId(threadUuid);

        if (!conversationId || conversationId !== threadUuid) {
          // Soft URL update — layout stays mounted; keep local messages.
          router.replace(
            `/${companySlug}/ai-workspace/${threadUuid}`,
            { scroll: false },
          );
        }

        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: res.content,
                  isStreaming: false,
                  thinking: false,
                }
              : m,
          );
          cacheThread(threadUuid, next);
          queryClient.setQueryData(
            queryKeys.company.conversation(companySlug, threadUuid),
            (old: unknown) => {
              const base =
                old && typeof old === "object"
                  ? (old as Record<string, unknown>)
                  : {};
              return {
                ...base,
                uuid: threadUuid,
                messages: next.map((m) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                })),
              };
            },
          );
          return next;
        });
        clearStreaming();

        const listKey = queryKeys.company.conversations(companySlug);
        queryClient.setQueryData(
          listKey,
          (old: unknown) => {
            const list = Array.isArray(old) ? [...old] : [];
            const existing = list.find(
              (c: { uuid?: string }) => c.uuid === threadUuid,
            ) as
              | {
                  uuid: string;
                  title: string;
                  provider: string;
                  model: string;
                  updated_at: string;
                  message_count: number;
                  pinned: boolean;
                }
              | undefined;
            const row = {
              uuid: threadUuid,
              title: existing?.title || prompt.slice(0, 80) || "Untitled",
              provider: res.provider || existing?.provider || provider,
              model: res.model || existing?.model || model,
              updated_at: new Date().toISOString(),
              message_count: (existing?.message_count ?? 0) + 2,
              pinned: existing?.pinned ?? false,
            };
            return [row, ...list.filter((c: { uuid?: string }) => c.uuid !== threadUuid)];
          },
        );
        void queryClient.invalidateQueries({ queryKey: listKey });
        // Soft refresh detail in background without forcing a blank paint.
        void queryClient.invalidateQueries({
          queryKey: queryKeys.company.conversation(companySlug, threadUuid),
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
      queryClient,
      setActiveConversationId,
    ],
  );

  function newChat() {
    stop();
    setMessages([]);
    setActiveId(undefined);
    setActiveConversationId(null);
    setNeedsHydrate(false);
    setDraft("");
    router.push(`/${companySlug}/ai-workspace`);
  }

  const activeProvider = providerOptions.find((p) => p.id === provider);
  const modelLabel = `${activeProvider?.label ?? provider} · ${
    activeProvider?.models.find((m) => m.id === model)?.label ?? model
  }`;

  const loadingThread =
    needsHydrate &&
    Boolean(activeId) &&
    conversation.isLoading &&
    messages.length === 0;
  const hydrateFailed =
    needsHydrate &&
    Boolean(activeId) &&
    conversation.isError &&
    messages.length === 0;
  const empty = !loadingThread && !hydrateFailed && messages.length === 0;
  // Only warn when the list loaded successfully and is empty — a failed
  // request (e.g. old 403) must not look like "no company keys".
  const noProviderConfigured =
    configuredProviders.isSuccess && configuredProviderNames.size === 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 w-full bg-ink">
      <ChatSidebar
        companySlug={companySlug}
        conversations={conversations.data ?? []}
        loading={conversations.isLoading}
        loadError={conversations.isError}
        activeId={activeId}
        pinnedIds={pinnedIds}
        onTogglePin={togglePin}
        onRename={renameConversation}
        onDelete={deleteConversation}
        onNewChat={newChat}
        onPrefetch={prefetchConversation}
        expanded={sidebarOpen}
        onExpandedChange={setSidebarOpen}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingThread ? (
            <AiChatLoader label="Loading conversation…" />
          ) : hydrateFailed ? (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <p className="max-w-md text-center text-[13px] text-text-secondary">
                This conversation could not be loaded. It may have been deleted
                or belongs to another account.
              </p>
            </div>
          ) : empty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 pb-8 pt-12">
              <div className="mb-4">
                <AiMark size="lg" />
              </div>
              <h1 className="text-center text-[1.75rem] font-medium tracking-tight text-text-primary md:text-[2rem]">
                How can I help you today?
              </h1>
              <p className="mt-2 max-w-md text-center text-[13px] text-text-secondary">
                Enterprise chat through IntelliROI Gateway. Pick project and task
                once via + — they stick for follow-ups.
              </p>
              <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-[20px] border border-hairline bg-surface/25 px-4 py-3.5 text-left text-[13px] leading-snug text-text-secondary transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-6 pt-2">
              {messages.map((m) => (
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
            <Can
              resource="providers_company"
              action="manage"
              fallback="Ask an owner or admin to add one under AI Providers."
            >
              <Link
                href={`/${companySlug}/ai-providers`}
                className="font-medium text-text-primary underline underline-offset-2"
              >
                Add one under AI Providers
              </Link>
              .
            </Can>
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
