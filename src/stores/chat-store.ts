import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  /** Sticky attribution — survives remounts / New Chat until user changes them. */
  projectId: string;
  taskId: string;
  provider: string;
  model: string;
  setActiveConversationId: (id: string | null) => void;
  setDraft: (value: string) => void;
  setStreamingBuffer: (value: string) => void;
  appendStreamingBuffer: (chunk: string) => void;
  clearStreaming: () => void;
  setProjectId: (id: string) => void;
  setTaskId: (id: string) => void;
  setProvider: (id: string) => void;
  setModel: (id: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      activeConversationId: null,
      draft: "",
      streamingBuffer: "",
      projectId: "",
      taskId: "",
      provider: "",
      model: "",
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setDraft: (value) => set({ draft: value }),
      setStreamingBuffer: (value) => set({ streamingBuffer: value }),
      appendStreamingBuffer: (chunk) =>
        set((s) => ({ streamingBuffer: s.streamingBuffer + chunk })),
      clearStreaming: () => set({ streamingBuffer: "" }),
      setProjectId: (id) => set({ projectId: id }),
      setTaskId: (id) => set({ taskId: id }),
      setProvider: (id) => set({ provider: id }),
      setModel: (id) => set({ model: id }),
    }),
    {
      name: "intelliroi-chat",
      partialize: (s) => ({
        projectId: s.projectId,
        taskId: s.taskId,
        provider: s.provider,
        model: s.model,
        activeConversationId: s.activeConversationId,
      }),
    },
  ),
);
