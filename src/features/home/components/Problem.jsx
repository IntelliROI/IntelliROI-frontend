import { EyeOff, Ghost, TrendingDown, ShieldAlert, Wallet, Building2 } from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const PROBLEMS = [
  { icon: EyeOff, code: "ERR-01", title: "Unknown Token Usage", desc: "Millions of tokens consumed daily with no record of who, where, or why." },
  { icon: Ghost, code: "ERR-02", title: "Shadow AI Sprawl", desc: "Teams adopting unsanctioned models and tools outside any security perimeter." },
  { icon: TrendingDown, code: "ERR-03", title: "No ROI Visibility", desc: "AI budgets approved on faith. No line of sight from spend to business value." },
  { icon: ShieldAlert, code: "ERR-04", title: "Zero Governance", desc: "No policy enforcement, no audit trail, no control over what data reaches which model." },
  { icon: Wallet, code: "ERR-05", title: "Subscription Waste", desc: "Overlapping seats and idle licenses quietly draining six figures a year." },
  { icon: Building2, code: "ERR-06", title: "Department Overspending", desc: "No per-team budgets, no alerts, no accountability until the invoice arrives." },
];

const Problem = () => (
  <SectionShell id="problem" data-testid="problem-section">
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <Reveal>
          <Chapter number="01" label="The Problem" id="problem" />
        </Reveal>
      </div>
      <div className="lg:col-span-8">
        <Reveal delay={0.1}>
          <h2 className="text-3xl font-medium tracking-tight text-text-primary md:text-5xl md:leading-[1.1]" data-testid="problem-headline">
            The AI Spending Problem. Enterprises are burning{" "}
            <span className="text-accent">millions on tokens</span> with zero
            visibility into{" "}
            <span className="text-accent">measurable business value</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            Which department spends the most? Which model costs the most? Which AI
            investments actually save time? Most leadership teams cannot answer a
            single one of these questions.
          </p>
        </Reveal>
      </div>
    </div>

    <div className="mt-16 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3" data-testid="problem-grid">
      {PROBLEMS.map((p, i) => (
        <Reveal key={p.code} delay={i * 0.06} className="h-full">
          <div
            className="group flex h-full flex-col bg-ink p-8 transition-colors duration-500 hover:bg-surface"
            data-testid={`problem-card-${p.code.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <p.icon size={22} strokeWidth={1.5} className="text-text-secondary transition-colors duration-500 group-hover:text-accent" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-text-secondary/50">{p.code}</span>
            </div>
            <h3 className="mt-8 text-lg font-medium tracking-tight text-text-primary">{p.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{p.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </SectionShell>
);

export default Problem;
