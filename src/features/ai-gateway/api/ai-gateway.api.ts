import { apiRequest, pagedRequest, withQuery, ApiError } from "@/lib/api/client";
import { LIST_PAGE_SIZE_MAX } from "@/lib/api/types";
import { services, shouldUseApiProxy } from "@/config/site";
import { useAuthStore } from "@/stores/auth-store";

export type ProviderModel = {
  id: number;
  name: string;
};

export type Provider = {
  id: number;
  name: string;
  display_name: string;
  models: string[];
  model_entries: ProviderModel[];
  status: string;
  latency_ms: number;
};

export type ConfiguredProvider = {
  id: number;
  provider: string;
  key_alias: string;
  created_at: string;
};

export type Conversation = {
  uuid: string;
  title: string;
  provider: string;
  model: string;
  updated_at: string;
  message_count: number;
  pinned: boolean;
};

export type ChatInput = {
  provider: string;
  model: string;
  prompt: string;
  project_id?: number | null;
  task_category_id?: number | null;
  conversation_uuid?: string;
};

export type ChatResponse = {
  request_uuid: string;
  conversation_uuid: string;
  content: string;
  provider: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
};

export type ConversationDetail = Conversation & {
  messages: { id: string; role: string; content: string }[];
};

type ProviderModelDto = { id?: number; model_name?: string; status?: string };

type ProviderDto = {
  id?: number;
  provider_name?: string;
  name?: string;
  display_name?: string;
  status?: string;
  models?: ProviderModelDto[] | string[];
};

type ConfiguredDto = {
  id: number;
  provider_name?: string;
  provider?: string;
  key_alias?: string;
  created_at?: string;
};

type ChatDto = {
  request_uuid?: string;
  conversation_uuid?: string;
  uuid?: string;
  provider?: string;
  model?: string;
  prompt?: string;
  response?: string;
  content?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  tokens_in?: number;
  tokens_out?: number;
};

type MessageDto = {
  id: number | string;
  role: string;
  content: string;
};

type ConversationDto = {
  id?: number;
  conversation_uuid?: string;
  uuid?: string;
  title?: string;
  pinned?: boolean;
  updated_at?: string;
  created_at?: string;
  provider?: string;
  model?: string;
  messages?: MessageDto[];
};

function toProvider(p: ProviderDto): Provider {
  const model_entries: ProviderModel[] = Array.isArray(p.models)
    ? p.models
        .map((m) =>
          typeof m === "string"
            ? { id: 0, name: m }
            : { id: m.id ?? 0, name: m.model_name ?? "" },
        )
        .filter((m) => m.name)
    : [];
  return {
    id: p.id ?? 0,
    name: p.provider_name ?? p.name ?? "",
    display_name: p.display_name ?? p.provider_name ?? p.name ?? "",
    models: model_entries.map((m) => m.name),
    model_entries,
    status: p.status ?? "unknown",
    latency_ms: 0,
  };
}

function toConfigured(p: ConfiguredDto): ConfiguredProvider {
  return {
    id: p.id,
    provider: p.provider_name ?? p.provider ?? "",
    key_alias: p.key_alias ?? "",
    created_at: p.created_at ?? "",
  };
}

function chatThreadUuid(r: ChatDto): string {
  return (r.conversation_uuid || r.uuid || "").trim();
}

function toConversation(c: ConversationDto): Conversation {
  return {
    uuid: (c.conversation_uuid ?? c.uuid ?? "").trim(),
    title: c.title || "Untitled",
    provider: c.provider ?? "",
    model: c.model ?? "",
    updated_at: c.updated_at ?? c.created_at ?? "",
    message_count: c.messages?.length ?? 0,
    pinned: Boolean(c.pinned),
  };
}

function toChat(r: ChatDto): ChatResponse {
  return {
    request_uuid: r.request_uuid ?? "",
    conversation_uuid: chatThreadUuid(r),
    content: r.response ?? r.content ?? "",
    provider: r.provider ?? "",
    model: r.model ?? "",
    tokens_in: r.usage?.prompt_tokens ?? r.tokens_in ?? 0,
    tokens_out: r.usage?.completion_tokens ?? r.tokens_out ?? 0,
  };
}

function chatAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("intelliroi_access_token")
      : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function applyNgrokHeader(headers: Record<string, string>, url: string) {
  if (shouldUseApiProxy() || url.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    (payload as { data: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function readErrorBody(res: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }
  const nested =
    body && typeof body === "object"
      ? (body as { error?: { code?: string; message?: string }; message?: string })
      : undefined;
  const code =
    nested?.error && typeof nested.error === "object"
      ? nested.error.code
      : undefined;
  const message =
    (nested?.error && typeof nested.error === "object"
      ? nested.error.message
      : undefined) ||
    nested?.message ||
    res.statusText ||
    "Request failed";
  return new ApiError(message, res.status, body, code);
}

/**
 * Parse SSE from POST /chat?stream=true. Keepalive `ping` events are ignored;
 * `message` carries the completed reply; `error` raises ApiError.
 */
async function parseChatSSE(
  res: Response,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  if (!res.body) {
    throw new ApiError("Empty chat stream", res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const acc: { reply: ChatResponse | null; err: ApiError | null } = {
    reply: null,
    err: null,
  };

  const handleBlock = (block: string) => {
    const lines = block.split("\n");
    let event = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
    if (dataLines.length === 0) return;
    const raw = dataLines.join("\n");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (event === "ping" || event === "done") return;
    if (event === "error") {
      const err = parsed as { code?: string; message?: string };
      acc.err = new ApiError(
        err.message || "Chat failed",
        500,
        parsed,
        err.code,
      );
      return;
    }
    if (event === "conversation") {
      const conv = parsed as { conversation_uuid?: string; uuid?: string };
      const uuid = (conv.conversation_uuid || conv.uuid || "").trim();
      if (!acc.reply) {
        acc.reply = {
          request_uuid: "",
          conversation_uuid: uuid,
          content: "",
          provider: "",
          model: "",
          tokens_in: 0,
          tokens_out: 0,
        };
      } else if (uuid) {
        acc.reply.conversation_uuid = uuid;
      }
      return;
    }
    if (event === "message") {
      const root = (parsed ?? {}) as Record<string, unknown>;
      const nested =
        root.data && typeof root.data === "object"
          ? (root.data as ChatDto)
          : null;
      const merged: ChatDto = {
        ...(root as ChatDto),
        ...(nested ?? {}),
      };
      const next = toChat(merged);
      acc.reply = {
        ...next,
        conversation_uuid:
          chatThreadUuid(merged) || acc.reply?.conversation_uuid || "",
      };
    }
  };

  while (true) {
    if (signal?.aborted) {
      await reader.cancel().catch(() => undefined);
      throw new DOMException("Aborted", "AbortError");
    }
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      if (part.trim()) handleBlock(part.replace(/\r/g, ""));
    }
  }
  if (buffer.trim()) handleBlock(buffer.replace(/\r/g, ""));

  if (acc.err) throw acc.err;
  if (!acc.reply?.conversation_uuid) {
    throw new ApiError(
      acc.reply
        ? "Chat succeeded but returned no conversation id"
        : "Chat stream ended without a reply",
      502,
    );
  }
  return acc.reply;
}

export const aiGatewayApi = {
  async listProviders(): Promise<Provider[]> {
    const page = await pagedRequest<ProviderDto>(
      "ai",
      withQuery("/providers", { page: 1, page_size: LIST_PAGE_SIZE_MAX }),
    );
    return page.items.map(toProvider);
  },

  async listConfigured(): Promise<ConfiguredProvider[]> {
    const page = await pagedRequest<ConfiguredDto>(
      "ai",
      withQuery("/providers/configured", {
        page: 1,
        page_size: LIST_PAGE_SIZE_MAX,
      }),
    );
    return page.items.map(toConfigured);
  },

  async addKey(
    providerName: string,
    input: { api_key: string; key_alias: string },
  ): Promise<ConfiguredProvider> {
    const raw = await apiRequest<ConfiguredDto>(
      "ai",
      `/providers/${providerName}/keys`,
      { method: "POST", body: input },
    );
    return toConfigured(raw);
  },

  async deleteKey(id: number): Promise<void> {
    await apiRequest("ai", `/providers/keys/${id}`, { method: "DELETE" });
  },

  /**
   * Chat via SSE keepalives (default on the gateway). Falls back to JSON
   * `?stream=false` if the response is not an event stream.
   */
  async chat(
    input: ChatInput,
    options?: { signal?: AbortSignal },
  ): Promise<ChatResponse> {
    const body: Record<string, unknown> = {
      provider: input.provider,
      model: input.model,
      prompt: input.prompt,
    };
    if (input.project_id) body.project_id = input.project_id;
    if (input.task_category_id) body.task_category_id = input.task_category_id;
    if (input.conversation_uuid) {
      body.conversation_uuid = input.conversation_uuid;
      body.uuid = input.conversation_uuid;
    }

    const base = services.ai.replace(/\/$/, "");
    const url = `${base}/chat?stream=true`;
    const headers = chatAuthHeaders();
    applyNgrokHeader(headers, url);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (res.status === 401) {
      // One refresh attempt, then retry once (mirrors axios interceptor).
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("intelliroi_refresh_token") ||
            useAuthStore.getState().refreshToken
          : null;
      if (refreshToken) {
        try {
          const refreshUrl = `${services.auth.replace(/\/$/, "")}/auth/refresh`;
          const refreshHeaders: Record<string, string> = {
            Accept: "application/json",
            "Content-Type": "application/json",
          };
          applyNgrokHeader(refreshHeaders, refreshUrl);
          const refreshed = await fetch(refreshUrl, {
            method: "POST",
            headers: refreshHeaders,
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (refreshed.ok) {
            const payload = unwrapEnvelope<{
              access_token?: string;
              refresh_token?: string;
            }>(await refreshed.json());
            if (payload.access_token) {
              useAuthStore.getState().setTokens({
                accessToken: payload.access_token,
                refreshToken: payload.refresh_token || refreshToken,
              });
              const retryHeaders = chatAuthHeaders();
              applyNgrokHeader(retryHeaders, url);
              const retry = await fetch(url, {
                method: "POST",
                headers: retryHeaders,
                body: JSON.stringify(body),
                signal: options?.signal,
              });
              if (!retry.ok) throw await readErrorBody(retry);
              const retryCt = retry.headers.get("content-type") ?? "";
              if (retryCt.includes("text/event-stream")) {
                return parseChatSSE(retry, options?.signal);
              }
              const raw = unwrapEnvelope<ChatDto>(await retry.json());
              return toChat(raw);
            }
          }
        } catch (err) {
          if (err instanceof ApiError) throw err;
        }
      }
      throw new ApiError("Unauthorized", 401, undefined, "UNAUTHORIZED");
    }

    if (!res.ok) {
      throw await readErrorBody(res);
    }

    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/event-stream")) {
      return parseChatSSE(res, options?.signal);
    }

    const raw = unwrapEnvelope<ChatDto>(await res.json());
    return toChat(raw);
  },

  async listConversations(): Promise<Conversation[]> {
    const page = await pagedRequest<ConversationDto>(
      "ai",
      withQuery("/conversations", { page: 1, page_size: LIST_PAGE_SIZE_MAX }),
    );
    return page.items.map(toConversation).filter((c) => c.uuid);
  },

  async getConversation(uuid: string): Promise<ConversationDetail> {
    const raw = await apiRequest<ConversationDto>("ai", `/conversations/${uuid}`);
    return {
      ...toConversation(raw),
      message_count: raw.messages?.length ?? 0,
      messages: (raw.messages ?? []).map((m) => ({
        id: String(m.id),
        role: m.role,
        content: m.content,
      })),
    };
  },

  async updateConversation(
    uuid: string,
    input: { title?: string; pinned?: boolean },
  ): Promise<Conversation> {
    const raw = await apiRequest<ConversationDto>(
      "ai",
      `/conversations/${uuid}`,
      { method: "PATCH", body: input },
    );
    return toConversation(raw);
  },

  async deleteConversation(uuid: string): Promise<void> {
    await apiRequest("ai", `/conversations/${uuid}`, { method: "DELETE" });
  },
};
