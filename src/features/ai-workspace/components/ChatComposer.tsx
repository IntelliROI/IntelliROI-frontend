"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  Briefcase,
  Check,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutTemplate,
  Paperclip,
  Plus,
  Square,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ComposerModelOption = {
  providerId: string;
  providerLabel: string;
  modelId: string;
  modelLabel: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  busy: boolean;
  disabled?: boolean;
  placeholder?: string;
  companySlug: string;
  providers: {
    id: string;
    label: string;
    models: { id: string; label: string }[];
  }[];
  provider: string;
  model: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (modelId: string) => void;
  projects: { id: number | string; name: string }[];
  tasks: { id: number | string; name: string }[];
  projectId: string;
  taskId: string;
  onProjectChange: (id: string) => void;
  onTaskChange: (id: string) => void;
};

type MenuPanel = "root" | "provider" | "model" | "project" | "task";

/**
 * ChatGPT-style composer: pill field, + tools menu, send/stop, disclaimer.
 */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  disabled,
  placeholder = "Ask anything",
  companySlug,
  providers,
  provider,
  model,
  onProviderChange,
  onModelChange,
  projects,
  tasks,
  projectId,
  taskId,
  onProjectChange,
  onTaskChange,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<MenuPanel>("root");

  const providerMeta = providers.find((p) => p.id === provider);
  const modelMeta = providerMeta?.models.find((m) => m.id === model);
  const projectName = projects.find((p) => String(p.id) === projectId)?.name;
  const taskName = tasks.find((t) => String(t.id) === taskId)?.name;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setPanel("root");
      }
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setPanel("root");
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy && value.trim()) onSubmit();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) {
      onStop();
      return;
    }
    if (value.trim()) onSubmit();
  }

  function openMenu() {
    setPanel("root");
    setMenuOpen((v) => !v);
  }

  return (
    <div className="px-3 pb-3 pt-1 md:px-6 md:pb-4">
      <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-3xl">
        <div ref={menuRef} className="relative">
          {menuOpen && (
            <div className="absolute bottom-[calc(100%+10px)] left-0 z-40 w-[min(100%,360px)] overflow-hidden rounded-[20px] border border-hairline bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
              {panel === "root" && (
                <div className="py-1.5">
                  <MenuRow
                    icon={<Paperclip className="h-4 w-4" strokeWidth={1.5} />}
                    title="Add photos & files"
                    subtitle="Upload from computer"
                    muted
                    onClick={() => {
                      /* MVP: wire upload later */
                      setMenuOpen(false);
                    }}
                  />
                  <div className="mx-3 my-1.5 h-px bg-hairline" />
                  <MenuRow
                    icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}
                    title="Provider & model"
                    subtitle={`${providerMeta?.label ?? provider} · ${modelMeta?.label ?? model}`}
                    onClick={() => setPanel("provider")}
                    trailing={<ChevronRight className="h-4 w-4 opacity-50" />}
                  />
                  <MenuRow
                    icon={<FolderKanban className="h-4 w-4" strokeWidth={1.5} />}
                    title="Project"
                    subtitle={projectName ?? "Attribute this chat to a project"}
                    onClick={() => setPanel("project")}
                    trailing={<ChevronRight className="h-4 w-4 opacity-50" />}
                  />
                  <MenuRow
                    icon={<Briefcase className="h-4 w-4" strokeWidth={1.5} />}
                    title="Task category"
                    subtitle={taskName ?? "Link a task benchmark"}
                    onClick={() => setPanel("task")}
                    trailing={<ChevronRight className="h-4 w-4 opacity-50" />}
                  />
                  <div className="mx-3 my-1.5 h-px bg-hairline" />
                  <Link
                    href={`/${companySlug}/ai-workspace/templates`}
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-2/60"
                  >
                    <span className="mt-0.5 text-text-secondary">
                      <LayoutTemplate className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-text-primary">
                        Prompt templates
                      </span>
                      <span className="block text-[12px] text-text-secondary/80">
                        Browse reusable prompts
                      </span>
                    </span>
                  </Link>
                </div>
              )}

              {panel === "provider" && (
                <SubPanel title="Provider" onBack={() => setPanel("root")}>
                  {providers.map((p) => (
                    <SelectRow
                      key={p.id}
                      label={p.label}
                      selected={p.id === provider}
                      onClick={() => {
                        onProviderChange(p.id);
                        setPanel("model");
                      }}
                    />
                  ))}
                </SubPanel>
              )}

              {panel === "model" && (
                <SubPanel title="Model" onBack={() => setPanel("provider")}>
                  {(providerMeta?.models ?? []).map((m) => (
                    <SelectRow
                      key={m.id}
                      label={m.label}
                      selected={m.id === model}
                      onClick={() => {
                        onModelChange(m.id);
                        setMenuOpen(false);
                        setPanel("root");
                      }}
                    />
                  ))}
                </SubPanel>
              )}

              {panel === "project" && (
                <SubPanel title="Project" onBack={() => setPanel("root")}>
                  <SelectRow
                    label="No project"
                    selected={!projectId}
                    onClick={() => {
                      onProjectChange("");
                      setMenuOpen(false);
                      setPanel("root");
                    }}
                  />
                  {projects.map((p) => (
                    <SelectRow
                      key={p.id}
                      label={p.name}
                      selected={String(p.id) === projectId}
                      onClick={() => {
                        onProjectChange(String(p.id));
                        setMenuOpen(false);
                        setPanel("root");
                      }}
                    />
                  ))}
                </SubPanel>
              )}

              {panel === "task" && (
                <SubPanel title="Task" onBack={() => setPanel("root")}>
                  <SelectRow
                    label="No task"
                    selected={!taskId}
                    onClick={() => {
                      onTaskChange("");
                      setMenuOpen(false);
                      setPanel("root");
                    }}
                  />
                  {tasks.map((t) => (
                    <SelectRow
                      key={t.id}
                      label={t.name}
                      selected={String(t.id) === taskId}
                      onClick={() => {
                        onTaskChange(String(t.id));
                        setMenuOpen(false);
                        setPanel("root");
                      }}
                    />
                  ))}
                </SubPanel>
              )}
            </div>
          )}

          {(projectName || taskName) && (
            <div className="mb-2 flex flex-wrap gap-1.5 px-1">
              {projectName && (
                <ContextChip
                  label={projectName}
                  onClear={() => onProjectChange("")}
                />
              )}
              {taskName && (
                <ContextChip label={taskName} onClear={() => onTaskChange("")} />
              )}
            </div>
          )}

          <div
            className={cn(
              "flex items-end gap-1.5 rounded-[28px] border border-hairline bg-surface/70 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.28)] transition-colors",
              "focus-within:border-accent/45 focus-within:bg-surface",
            )}
          >
            <button
              type="button"
              onClick={openMenu}
              className={cn(
                "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors",
                "hover:bg-surface-2 hover:text-text-primary",
                menuOpen && "bg-surface-2 text-accent",
              )}
              aria-label="Add context and tools"
              aria-expanded={menuOpen}
            >
              <Plus className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <textarea
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-6 text-text-primary placeholder:text-text-secondary/55 focus:outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!busy && (!value.trim() || disabled)}
              className={cn(
                "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                busy
                  ? "border-text-primary/60 bg-transparent text-text-primary hover:bg-text-primary/10"
                  : "border-accent bg-transparent text-accent hover:bg-accent/10 disabled:border-hairline disabled:text-text-secondary/40",
              )}
              aria-label={busy ? "Stop generating" : "Send message"}
              title={busy ? "Stop" : "Send"}
            >
              {busy ? (
                <Square className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
              ) : (
                <ArrowUp className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        <p className="mt-2.5 text-center text-[12px] text-text-secondary/70">
          IntelliROI can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}

function ContextChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface/50 py-0.5 pl-2.5 pr-1 text-[11px] text-text-secondary">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-surface-2 hover:text-text-primary"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" strokeWidth={1.5} />
      </button>
    </span>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  onClick,
  trailing,
  muted,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  trailing?: ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-2/60",
        muted && "bg-surface-2/30",
      )}
    >
      <span className="mt-0.5 text-text-secondary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-text-primary">
          {title}
        </span>
        <span className="block truncate text-[12px] text-text-secondary/80">
          {subtitle}
        </span>
      </span>
      {trailing}
    </button>
  );
}

function SubPanel({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          aria-label="Back"
        >
          <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={1.5} />
        </button>
        <p className="text-[13px] font-medium text-text-primary">{title}</p>
      </div>
      <div className="max-h-64 overflow-y-auto py-1">{children}</div>
    </div>
  );
}

function SelectRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] text-text-primary transition-colors hover:bg-surface-2/60"
    >
      <span className="flex-1 truncate">{label}</span>
      {selected && <Check className="h-4 w-4 text-accent" strokeWidth={1.5} />}
    </button>
  );
}
