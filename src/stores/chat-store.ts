import { create } from "zustand";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
};

type ChatState = {
  activeConversationId: string | null;
  draft: string;
  streamingBuffer: string;
  setActiveConversationId: (id: string | null) => void;
  setDraft: (value: string) => void;
  setStreamingBuffer: (value: string) => void;
  appendStreamingBuffer: (chunk: string) => void;
  clearStreaming: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  draft: "",
  streamingBuffer: "",
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setDraft: (value) => set({ draft: value }),
  setStreamingBuffer: (value) => set({ streamingBuffer: value }),
  appendStreamingBuffer: (chunk) =>
    set((s) => ({ streamingBuffer: s.streamingBuffer + chunk })),
  clearStreaming: () => set({ streamingBuffer: "" }),
}));
