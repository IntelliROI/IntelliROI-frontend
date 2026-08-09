import { apiRequest, useMocks } from "@/lib/api/client";
import {
  delay,
  mockConfiguredProviders,
  mockConversations,
  mockProviders,
} from "@/lib/mocks/data";

export type Provider = (typeof mockProviders)[number];
export type ConfiguredProvider = (typeof mockConfiguredProviders)[number];
export type Conversation = (typeof mockConversations)[number];

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
    if (useMocks) return delay(mockProviders);
    return apiRequest<Provider[]>("ai", "/providers");
  },

  async listConfigured(): Promise<ConfiguredProvider[]> {
    if (useMocks) return delay(mockConfiguredProviders);
    return apiRequest<ConfiguredProvider[]>("ai", "/providers/configured");
  },

  async addKey(
    providerName: string,
    input: { api_key: string; key_alias: string },
  ): Promise<ConfiguredProvider> {
    if (useMocks) {
      return delay({
        id: Date.now(),
        provider: providerName,
        key_alias: input.key_alias,
        created_at: new Date().toISOString(),
      });
    }
    return apiRequest<ConfiguredProvider>("ai", `/providers/${providerName}/keys`, {
      method: "POST",
      body: input,
    });
  },

  async deleteKey(id: number): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("ai", `/providers/keys/${id}`, { method: "DELETE" });
  },

  async chat(
    input: ChatInput,
    options?: { signal?: AbortSignal },
  ): Promise<ChatResponse> {
    if (useMocks) {
      const conversationUuid = input.conversation_uuid || `conv-${Date.now()}`;
      // Respect abort during mock latency
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, 600);
        options?.signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true },
        );
      });
      if (options?.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      return {
        request_uuid: `req-${Date.now()}`,
        conversation_uuid: conversationUuid,
        content: `Understood. Here's a concise enterprise response for: "${input.prompt.slice(0, 120)}".\n\nIntelliROI gateway metered this call on ${input.provider}/${input.model}. Cost & Estimated ROI land asynchronously in Pipeline 2 — this pane never waits on them.\n\nNext steps you can take:\n1. Attach a project + task category for accurate ROI attribution\n2. Continue refining the prompt\n3. Review usage on your personal dashboard`,
        provider: input.provider,
        model: input.model,
        tokens_in: 120 + input.prompt.length,
        tokens_out: 180,
      };
    }
    return apiRequest<ChatResponse>("ai", "/chat", {
      method: "POST",
      body: input,
      signal: options?.signal,
    });
  },

  async listConversations(): Promise<Conversation[]> {
    if (useMocks) return delay(mockConversations);
    return apiRequest<Conversation[]>("ai", "/conversations");
  },

  async getConversation(uuid: string): Promise<ConversationDetail> {
    if (useMocks) {
      const found = mockConversations.find((c) => c.uuid === uuid);
      return delay({
        ...(found ?? mockConversations[0]),
        messages: [
          {
            id: "m1",
            role: "user",
            content: "Help me design a department ROI comparison table.",
          },
          {
            id: "m2",
            role: "assistant",
            content:
              "Use spend, business value, ROI %, and adoption as columns. Sort by ROI descending for executive review.",
          },
        ],
      });
    }
    return apiRequest<ConversationDetail>("ai", `/conversations/${uuid}`);
  },
};
