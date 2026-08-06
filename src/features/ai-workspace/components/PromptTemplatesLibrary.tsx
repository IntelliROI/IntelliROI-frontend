"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Textarea, Input, Label } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

type Template = {
  id: string;
  title: string;
  body: string;
  category: string;
};

const SEED: Template[] = [
  {
    id: "tpl-1",
    title: "Code review checklist",
    body: "Review this diff for security, performance, and readability. List findings as bullets.",
    category: "Engineering",
  },
  {
    id: "tpl-2",
    title: "Customer email rewrite",
    body: "Rewrite this support email to be concise, empathetic, and action-oriented.",
    category: "Support",
  },
];

export function PromptTemplatesLibrary({
  companySlug,
}: {
  companySlug: string;
}) {
  void companySlug;
  const [templates, setTemplates] = useState(SEED);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function addTemplate() {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body required");
      return;
    }
    setTemplates((t) => [
      {
        id: `tpl-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        category: "Custom",
      },
      ...t,
    ]);
    setTitle("");
    setBody("");
    toast.success("Template saved");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Prompt templates"
        description="Reusable prompts tagged for projects and task categories."
      />

      <div className="mb-8 grid gap-4 border border-hairline p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Body</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <Button type="button" onClick={addTemplate}>
          Save template
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState title="No templates yet" />
      ) : (
        <div className="space-y-px bg-hairline">
          {templates.map((t) => (
            <Panel key={t.id} className="border-0 bg-ink p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                {t.category}
              </p>
              <h3 className="mt-2 font-medium text-text-primary">{t.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t.body}</p>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
