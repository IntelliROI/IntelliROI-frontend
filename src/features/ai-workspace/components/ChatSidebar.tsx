"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  MessageSquare,
  MessageSquarePlus,
  PanelLeft,
  Pin,
  Search,
  SquarePen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiMark } from "@/features/ai-workspace/components/AiMark";

export type ConversationListItem = {
  uuid: string;
  title: string;
};

type Props = {
  companySlug: string;
  conversations: ConversationListItem[];
  loading?: boolean;
  activeId?: string;
  pinnedIds: string[];
  onTogglePin: (uuid: string) => void;
  onNewChat: () => void;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
};

/**
 * ChatGPT-style conversation rail: icon strip when collapsed, full list when open.
 */
export function ChatSidebar({
  companySlug,
  conversations,
  loading,
  activeId,
  pinnedIds,
  onTogglePin,
  onNewChat,
  expanded,
  onExpandedChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [view, setView] = useState<"all" | "pinned">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const match = !q || c.title.toLowerCase().includes(q);
      if (!match) return false;
      if (view === "pinned") return pinnedIds.includes(c.uuid);
      return true;
    });
  }, [conversations, search, view, pinnedIds]);

  const pinned = conversations.filter((c) => pinnedIds.includes(c.uuid));
  const recent = conversations.filter((c) => !pinnedIds.includes(c.uuid));

  function openAndFocusSearch() {
    onExpandedChange(true);
    setShowSearch(true);
    setView("all");
  }

  function openPinned() {
    onExpandedChange(true);
    setView("pinned");
    setShowSearch(false);
  }

  function openChats() {
    onExpandedChange(true);
    setView("all");
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-hairline bg-ink transition-[width] duration-300 ease-out-expo",
        expanded ? "w-[280px]" : "w-[52px]",
      )}
    >
      {!expanded ? (
        <div className="flex flex-1 flex-col items-center py-3">
          <div className="mb-3">
            <AiMark size="sm" />
          </div>
          <IconBtn label="Expand sidebar" onClick={() => onExpandedChange(true)}>
            <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
          </IconBtn>
          <div className="mt-3 flex flex-col items-center gap-1">
            <IconBtn label="New chat" onClick={onNewChat} accent>
              <SquarePen className="h-4 w-4" strokeWidth={1.5} />
            </IconBtn>
            <IconBtn label="Search chats" onClick={openAndFocusSearch}>
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </IconBtn>
            <IconBtn label="Pinned chats" onClick={openPinned}>
              <Pin className="h-4 w-4" strokeWidth={1.5} />
            </IconBtn>
            <IconBtn label="Chats" onClick={openChats}>
              <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
            </IconBtn>
          </div>
          <div className="mt-auto pb-1">
            <Link
              href={`/${companySlug}/ai-workspace/templates`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              title="Templates"
            >
              <LayoutTemplate className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-hairline p-2.5">
            <AiMark size="sm" />
            <button
              type="button"
              onClick={onNewChat}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[12px] border border-hairline text-[13px] font-medium text-text-primary transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            >
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.5} />
              New chat
            </button>
            <IconBtn
              label="Collapse sidebar"
              onClick={() => onExpandedChange(false)}
            >
              <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
            </IconBtn>
          </div>

          <div className="flex items-center gap-1 border-b border-hairline px-2 py-2">
            <button
              type="button"
              onClick={() => {
                setView("all");
                setShowSearch((v) => !v);
              }}
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[12px] transition-colors",
                showSearch || view === "all"
                  ? "bg-surface text-text-primary"
                  : "text-text-secondary hover:bg-surface/50",
              )}
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setView("pinned");
                setShowSearch(false);
              }}
              className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[12px] transition-colors",
                view === "pinned"
                  ? "bg-surface text-text-primary"
                  : "text-text-secondary hover:bg-surface/50",
              )}
            >
              <Pin className="h-3.5 w-3.5" strokeWidth={1.5} />
              Pinned
            </button>
          </div>

          {showSearch && view === "all" && (
            <div className="border-b border-hairline px-2.5 py-2">
              <div className="flex h-9 items-center gap-2 rounded-[12px] border border-hairline bg-surface/40 px-2.5">
                <Search
                  className="h-3.5 w-3.5 text-text-secondary"
                  strokeWidth={1.5}
                />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="relative">
                  <AiMark size="sm" pulse />
                  <span className="absolute inset-[-4px] animate-spin rounded-full border border-transparent border-t-brand/60" />
                </div>
              </div>
            ) : view === "pinned" ? (
              pinned.length === 0 ? (
                <EmptyHint text="No pinned chats yet. Pin from the list." />
              ) : (
                <ConversationGroup
                  companySlug={companySlug}
                  title="Pinned"
                  items={pinned}
                  activeId={activeId}
                  pinnedIds={pinnedIds}
                  onTogglePin={onTogglePin}
                />
              )
            ) : filtered.length === 0 ? (
              <EmptyHint text="No conversations yet" />
            ) : (
              <>
                {pinned.length > 0 && !search && (
                  <ConversationGroup
                    companySlug={companySlug}
                    title="Pinned"
                    items={pinned}
                    activeId={activeId}
                    pinnedIds={pinnedIds}
                    onTogglePin={onTogglePin}
                  />
                )}
                <ConversationGroup
                  companySlug={companySlug}
                  title={search ? "Results" : "Recent"}
                  items={search ? filtered : recent}
                  activeId={activeId}
                  pinnedIds={pinnedIds}
                  onTogglePin={onTogglePin}
                />
              </>
            )}
          </div>

          <div className="border-t border-hairline p-2.5">
            <Link
              href={`/${companySlug}/ai-workspace/templates`}
              className="flex h-9 items-center justify-center gap-2 rounded-[12px] text-[12px] text-text-secondary transition-colors hover:bg-surface/50 hover:text-text-primary"
            >
              <LayoutTemplate className="h-3.5 w-3.5" strokeWidth={1.5} />
              Prompt templates
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  accent,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        accent
          ? "text-accent hover:bg-accent/10"
          : "text-text-secondary hover:bg-surface hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="px-2 py-8 text-center text-[12px] text-text-secondary">
      {text}
    </p>
  );
}

function ConversationGroup({
  companySlug,
  title,
  items,
  activeId,
  pinnedIds,
  onTogglePin,
}: {
  companySlug: string;
  title: string;
  items: ConversationListItem[];
  activeId?: string;
  pinnedIds: string[];
  onTogglePin: (uuid: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/60">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((c) => {
          const pinned = pinnedIds.includes(c.uuid);
          return (
            <li key={c.uuid} className="group/item relative">
              <Link
                href={`/${companySlug}/ai-workspace/${c.uuid}`}
                className={cn(
                  "block truncate rounded-[10px] py-2.5 pl-3 pr-9 text-[13px] transition-colors",
                  activeId === c.uuid
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface/60 hover:text-text-primary",
                )}
              >
                {c.title}
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onTogglePin(c.uuid);
                }}
                className={cn(
                  "absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary opacity-0 transition-opacity hover:bg-surface-2 hover:text-text-primary group-hover/item:opacity-100",
                  pinned && "opacity-100 text-accent",
                )}
                aria-label={pinned ? "Unpin" : "Pin"}
                title={pinned ? "Unpin" : "Pin"}
              >
                <Pin
                  className={cn("h-3.5 w-3.5", pinned && "fill-current")}
                  strokeWidth={1.5}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
