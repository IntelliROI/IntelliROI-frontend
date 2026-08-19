import { apiRequest } from "@/lib/api/client";

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
  request_uuid: string;
  conversation_uuid: string;
  provider: string;
  model: string;
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

function asList<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

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

function toConversation(c: ConversationDto): Conversation {
  return {
    uuid: c.conversation_uuid ?? c.uuid ?? "",
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
    request_uuid: r.request_uuid,
    conversation_uuid: r.conversation_uuid,
    content: r.response ?? r.content ?? "",
    provider: r.provider,
    model: r.model,
    tokens_in: r.usage?.prompt_tokens ?? r.tokens_in ?? 0,
    tokens_out: r.usage?.completion_tokens ?? r.tokens_out ?? 0,
  };
}

export const aiGatewayApi = {
  async listProviders(): Promise<Provider[]> {
    const raw = await apiRequest<ProviderDto[]>("ai", "/providers");
    return asList<ProviderDto>(raw).map(toProvider);
  },

  async listConfigured(): Promise<ConfiguredProvider[]> {
    const raw = await apiRequest<ConfiguredDto[]>("ai", "/providers/configured");
    return asList<ConfiguredDto>(raw).map(toConfigured);
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
    if (input.conversation_uuid) body.conversation_uuid = input.conversation_uuid;

    const raw = await apiRequest<ChatDto>("ai", "/chat", {
      method: "POST",
      body,
      signal: options?.signal,
    });
    return toChat(raw);
  },

  async listConversations(): Promise<Conversation[]> {
    const raw = await apiRequest<ConversationDto[]>("ai", "/conversations");
    return asList<ConversationDto>(raw).map(toConversation);
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
