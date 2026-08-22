import { motion } from "framer-motion";
import { Reveal, Chapter, SectionShell } from "./shared";

const LAYERS = [
  { id: "L1", name: "Company", note: "One governed AI estate" },
  { id: "L2", name: "Departments", note: "Budgets + policy per org unit" },
  { id: "L3", name: "Teams", note: "Usage patterns + benchmarks" },
  { id: "L4", name: "Employees", note: "Every request attributed" },
  { id: "L5", name: "AI Gateway", note: "Enforcement point", accent: true },
  { id: "L6", name: "Providers", note: "OpenAI · Anthropic · Gemini · Bedrock" },
  { id: "L7", name: "Analytics", note: "Token → cost → value" },
  { id: "L8", name: "ROI", note: "Defensible numbers", accent: true },
  { id: "L9", name: "Executives", note: "Decisions, not guesses" },
];

const Architecture = () => (
  <SectionShell id="architecture" className="border-t border-hairline bg-surface/20">
    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Reveal>
          <Chapter number="06" label="Enterprise Architecture" id="architecture" />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-10 text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="architecture-headline">
            From the boardroom to <span className="text-accent">a single token.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary md:text-lg">
            IntelliROI mirrors your org chart. Policy flows down from the company
            level; intelligence flows back up — every layer reconciled, every
            request attributed, every dollar accounted for.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-px border border-hairline bg-hairline" data-testid="architecture-stats">
            {[
              ["ORG SYNC", "SCIM / SSO"],
              ["DEPLOYMENT", "VPC OR SAAS"],
              ["DATA RETENTION", "YOU DECIDE"],
              ["UPTIME SLA", "99.99%"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink p-5">
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">{k}</div>
                <div className="mt-1 font-mono text-sm text-accent">{v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <div className="relative" data-testid="architecture-pipeline">
          <div className="absolute bottom-6 left-[27px] top-6 w-px bg-hairline" />
          <motion.span
            className="absolute left-[25px] h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(0,229,168,0.9)]"
            animate={{ top: ["4%", "96%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="space-y-3">
            {LAYERS.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`relative flex items-center gap-5 border p-4 pl-6 transition-colors duration-500 ${
                  l.accent
                    ? "border-accent/50 bg-accent/5"
                    : "border-hairline bg-ink hover:border-accent/40"
                }`}
                data-testid={`arch-layer-${l.id.toLowerCase()}`}
              >
                <span className={`absolute -left-px top-1/2 h-px w-6 ${l.accent ? "bg-accent" : "bg-hairline"}`} />
                <span className={`font-mono text-[10px] tracking-[0.2em] ${l.accent ? "text-accent" : "text-text-secondary/50"}`}>
                  {l.id}
                </span>
                <div className="flex flex-1 items-baseline justify-between gap-4">
                  <span className="text-sm font-medium tracking-tight text-text-primary md:text-base">{l.name}</span>
                  <span className="text-right font-mono text-[10px] text-text-secondary">{l.note}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </SectionShell>
);

export default Architecture;
