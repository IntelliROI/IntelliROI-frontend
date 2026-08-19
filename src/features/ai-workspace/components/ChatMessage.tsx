"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessageView = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  /** True while waiting on the provider — no content yet. Not real token streaming. */
  thinking?: boolean;
  stopped?: boolean;
};

/**
 * Bouncing-dot "thinking" indicator shown while the gateway waits on the
 * full provider response (up to ~120s). Ticks an elapsed-seconds label so a
 * slow reply doesn't look frozen.
 */
function ThinkingIndicator() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent/70"
            style={{
              animation: "bounce-dot 1.1s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </span>
      <span className="text-[12px] text-text-secondary/70">
        Thinking{elapsed > 2 ? ` \u00b7 ${elapsed}s` : ""}
      </span>
    </div>
  );
}

/**
 * ChatGPT-style message row — user right-aligned bubble, assistant left prose.
 */
export function ChatMessageBubble({
  message,
  modelLabel,
}: {
  message: ChatMessageView;
  modelLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const isUser = message.role === "user";

  async function copy() {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (isUser) {
    return (
      <div className="group/msg w-full px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-3xl justify-end">
          <div className="max-w-[85%] rounded-[22px] bg-surface-2 px-4 py-2.5 text-[15px] leading-7 text-text-primary">
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="mt-1.5 flex justify-end opacity-100 transition-opacity md:opacity-0 md:group-hover/msg:opacity-100">
              <ActionBtn onClick={copy} label={copied ? "Copied" : "Copy"}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </ActionBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/msg w-full px-4 py-4 md:px-6 md:py-5">
      <div className="mx-auto flex max-w-3xl gap-3.5">
        <div
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-accent/10"
          aria-hidden
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-text-primary">
              IntelliROI
            </span>
            {modelLabel && (
              <span className="text-[11px] text-text-secondary/70">{modelLabel}</span>
            )}
            {message.isStreaming && !message.thinking && (
              <span className="text-[11px] text-accent animate-pulse">
                Generating…
              </span>
            )}
            {message.stopped && (
              <span className="text-[11px] text-warning">Stopped</span>
            )}
          </div>

          {message.thinking ? (
            <ThinkingIndicator />
          ) : (
            <div
              className={cn(
                "whitespace-pre-wrap text-[15px] leading-7 text-text-primary",
                message.isStreaming && !message.content && "min-h-[1.75rem]",
              )}
            >
              {message.content || (message.isStreaming ? "" : "—")}
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent align-middle" />
              )}
            </div>
          )}

          {message.content && !message.isStreaming && (
            <div className="mt-2.5 flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/msg:opacity-100">
              <ActionBtn onClick={copy} label={copied ? "Copied" : "Copy"}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </ActionBtn>
              <ActionBtn
                onClick={() => setLiked((v) => (v === "up" ? null : "up"))}
                label="Good response"
                active={liked === "up"}
              >
                <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} />
              </ActionBtn>
              <ActionBtn
                onClick={() => setLiked((v) => (v === "down" ? null : "down"))}
                label="Bad response"
                active={liked === "down"}
                warn
              >
                <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.5} />
              </ActionBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  label,
  active,
  warn,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  warn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary",
        active && !warn && "text-accent",
        active && warn && "text-warning",
      )}
    >
      {children}
    </button>
  );
}
