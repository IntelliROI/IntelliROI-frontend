import { apiRequest } from "@/lib/api/client";

export type Provider = {
  name: string;
  display_name: string;
  models: string[];
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

export const aiGatewayApi = {
  async listProviders(): Promise<Provider[]> {
    return apiRequest<Provider[]>("ai", "/providers");
  },

  async listConfigured(): Promise<ConfiguredProvider[]> {
    return apiRequest<ConfiguredProvider[]>("ai", "/providers/configured");
  },

  async addKey(
    providerName: string,
    input: { api_key: string; key_alias: string },
  ): Promise<ConfiguredProvider> {
    return apiRequest<ConfiguredProvider>("ai", `/providers/${providerName}/keys`, {
      method: "POST",
      body: input,
    });
  },

  async deleteKey(id: number): Promise<void> {
    await apiRequest("ai", `/providers/keys/${id}`, { method: "DELETE" });
  },

  async chat(
    input: ChatInput,
    options?: { signal?: AbortSignal },
  ): Promise<ChatResponse> {
    return apiRequest<ChatResponse>("ai", "/chat", {
      method: "POST",
      body: input,
      signal: options?.signal,
    });
  },

  async listConversations(): Promise<Conversation[]> {
    return apiRequest<Conversation[]>("ai", "/conversations");
  },

  async getConversation(uuid: string): Promise<ConversationDetail> {
    return apiRequest<ConversationDetail>("ai", `/conversations/${uuid}`);
  },
};
