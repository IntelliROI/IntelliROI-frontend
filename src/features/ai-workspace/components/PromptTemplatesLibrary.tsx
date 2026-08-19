"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Template = {
  id: string;
  title: string;
  body: string;
  category: string;
  description: string;
};

const SEED: Template[] = [
  {
    id: "tpl-1",
    title: "Code review checklist",
    description: "Security, performance, and readability pass on a diff.",
    body: "Review this diff for security, performance, and readability. List findings as bullets with severity.",
    category: "Engineering",
  },
  {
    id: "tpl-2",
    title: "Customer email rewrite",
    description: "Concise, empathetic support replies.",
    body: "Rewrite this support email to be concise, empathetic, and action-oriented.",
    category: "Support",
  },
  {
    id: "tpl-3",
    title: "Estimated ROI brief",
    description: "Executive one-pager from usage and cost.",
    body: "Summarize Estimated ROI for leadership: usage → cost → estimated business value → Estimated ROI. Keep jargon low.",
    category: "Leadership",
  },
  {
    id: "tpl-4",
    title: "SQL cost rollup",
    description: "Department and team cost aggregation.",
    body: "Write SQL to roll up AI cost by department and team for the last 30 days. Include token counts.",
    category: "Analytics",
  },
  {
    id: "tpl-5",
    title: "Policy check",
    description: "Validate a prompt against company AI policy.",
    body: "Check whether this prompt violates our AI usage policy. Flag PII, secrets, and unsafe asks.",
    category: "Governance",
  },
  {
    id: "tpl-6",
    title: "Standup helper",
    description: "Turn notes into a crisp standup update.",
    body: "Turn these notes into a 3-bullet standup: done, doing, blockers.",
    category: "Team",
  },
];

const CATEGORIES = [
  "All",
  "Engineering",
  "Support",
  "Leadership",
  "Analytics",
  "Governance",
  "Team",
  "Custom",
] as const;

/**
 * ChatGPT GPTs-store inspired prompt template gallery.
 */
export function PromptTemplatesLibrary({
  companySlug,
}: {
  companySlug: string;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState(SEED);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [description, setDescription] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templates.filter((t) => {
      const catOk = category === "All" || t.category === category;
      const qOk =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [templates, category, search]);

  function useTemplate(t: Template) {
    router.push(
      `/${companySlug}/ai-workspace?prompt=${encodeURIComponent(t.body)}`,
    );
  }

  async function copyTemplate(t: Template) {
    try {
      await navigator.clipboard.writeText(t.body);
      toast.success("Prompt copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  function addTemplate() {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and prompt body required");
      return;
    }
    setTemplates((list) => [
      {
        id: `tpl-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        description: description.trim() || "Custom prompt template",
        category: "Custom",
      },
      ...list,
    ]);
    setTitle("");
    setBody("");
    setDescription("");
    setCreating(false);
    toast.success("Template saved");
  }

  function removeTemplate(id: string) {
    setTemplates((list) => list.filter((t) => t.id !== id));
    toast.message("Template removed");
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col bg-ink">
      <header className="shrink-0 border-b border-hairline px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/${companySlug}/ai-workspace`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              aria-label="Back to chat"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-xl font-medium tracking-tight text-text-primary md:text-2xl">
                Prompt templates
              </h1>
              <p className="mt-0.5 text-[13px] text-text-secondary">
                Local-only starters — there is no prompt-templates API yet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="inline-flex h-10 items-center gap-2 border border-accent bg-transparent px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent/10"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New template
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-[16px] border border-hairline bg-surface/40 px-3.5">
              <Search className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates"
                className="w-full bg-transparent text-[14px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] transition-colors",
                  category === c
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-hairline text-text-secondary hover:border-accent/30 hover:text-text-primary",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {creating && (
            <div className="mb-6 rounded-[20px] border border-hairline bg-surface/30 p-4 md:p-5">
              <p className="mb-3 text-[13px] font-medium text-text-primary">
                Create template
              </p>
              <div className="grid gap-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="h-10 rounded-[12px] border border-hairline bg-ink px-3 text-[14px] text-text-primary outline-none focus:border-accent/50"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                  className="h-10 rounded-[12px] border border-hairline bg-ink px-3 text-[14px] text-text-primary outline-none focus:border-accent/50"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Prompt body"
                  rows={4}
                  className="rounded-[12px] border border-hairline bg-ink px-3 py-2.5 text-[14px] text-text-primary outline-none focus:border-accent/50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addTemplate}
                    className="h-9 border border-accent bg-transparent px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/10"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="h-9 border border-hairline bg-transparent px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-hairline px-6 py-16 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-text-secondary" strokeWidth={1.5} />
              <p className="mt-3 text-[14px] text-text-secondary">
                No templates match this filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <article
                  key={t.id}
                  className="group flex flex-col rounded-[20px] border border-hairline bg-surface/25 p-4 transition-colors hover:border-accent/35 hover:bg-surface/45"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] border border-accent/30 bg-accent/10">
                    <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/70">
                    {t.category}
                  </p>
                  <h3 className="mt-1.5 text-[15px] font-medium text-text-primary">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-snug text-text-secondary">
                    {t.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => useTemplate(t)}
                      className="h-8 flex-1 border border-accent bg-transparent font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/10"
                    >
                      Use in chat
                    </button>
                    <button
                      type="button"
                      onClick={() => copyTemplate(t)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                      aria-label="Copy prompt"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    {t.category === "Custom" && (
                      <button
                        type="button"
                        onClick={() => removeTemplate(t.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-danger"
                        aria-label="Delete template"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-10 text-center text-[12px] text-text-secondary/70">
            IntelliROI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
