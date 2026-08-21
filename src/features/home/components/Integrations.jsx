import {
  Bot, Brain, Sparkles, Cloud, Database, Code, KanbanSquare,
  MessageSquare, Users, BookOpen, FileText, Webhook,
} from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const INTEGRATIONS = [
  { icon: Bot, name: "OpenAI", type: "AI PROVIDER" },
  { icon: Brain, name: "Anthropic", type: "AI PROVIDER" },
  { icon: Sparkles, name: "Google Gemini", type: "AI PROVIDER" },
  { icon: Cloud, name: "Azure OpenAI", type: "AI PROVIDER" },
  { icon: Database, name: "Amazon Bedrock", type: "AI PROVIDER" },
  { icon: Code, name: "GitHub", type: "ENGINEERING" },
  { icon: KanbanSquare, name: "Jira", type: "PRODUCTIVITY" },
  { icon: MessageSquare, name: "Slack", type: "ALERTS" },
  { icon: Users, name: "Microsoft Teams", type: "ALERTS" },
  { icon: BookOpen, name: "Confluence", type: "KNOWLEDGE" },
  { icon: FileText, name: "Notion", type: "KNOWLEDGE" },
  { icon: Webhook, name: "Webhook API", type: "CUSTOM" },
];

const Integrations = () => (
  <SectionShell id="integrations" className="border-t border-hairline">
    <Reveal>
      <Chapter number="07" label="Integrations" id="integrations" />
    </Reveal>
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end">
      <Reveal delay={0.1}>
        <h2 className="text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="integrations-headline">
          Plugs into the stack <span className="text-accent">you already run.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="max-w-xl text-base leading-relaxed text-text-secondary md:text-lg lg:ml-auto">
          No rip-and-replace. IntelliROI brokers your existing providers and
          pushes intelligence into the tools your teams already live in.
        </p>
      </Reveal>
    </div>

    <div className="mt-16 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-6" data-testid="integrations-grid">
      {INTEGRATIONS.map((it, i) => (
        <Reveal key={it.name} delay={(i % 6) * 0.05} className="h-full">
          <div
            className="group relative flex h-full min-h-[150px] flex-col items-center justify-center gap-3 bg-ink p-6 transition-colors duration-500 hover:bg-surface"
            data-testid={`integration-${it.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <span className="absolute right-2 top-2 border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.15em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              CONNECTED
            </span>
            <it.icon size={24} strokeWidth={1.5} className="text-text-secondary transition-colors duration-500 group-hover:text-accent" />
            <span className="text-center text-xs font-medium text-text-primary">{it.name}</span>
            <span className="font-mono text-[8px] tracking-[0.2em] text-text-secondary/50">{it.type}</span>
          </div>
        </Reveal>
      ))}
    </div>
  </SectionShell>
);

export default Integrations;
