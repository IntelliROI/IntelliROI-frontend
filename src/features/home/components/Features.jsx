import {
  Network, Coins, Gauge, Cpu, Building2, TrendingUp,
  LayoutDashboard, ShieldCheck, ScrollText, KeyRound, Lock, BellRing,
} from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const FEATURES = [
  { icon: Network, code: "MOD-01", title: "AI Gateway", desc: "A single governed entry point for every model request across the enterprise. Route, log, and policy-check all traffic.", span: "md:col-span-2" },
  { icon: Coins, code: "MOD-02", title: "Token Tracking", desc: "Per-user, per-model, per-department token telemetry in real time.", span: "" },
  { icon: Gauge, code: "MOD-03", title: "Cost Monitoring", desc: "Live spend attribution with budgets, thresholds, and anomaly detection.", span: "" },
  { icon: Cpu, code: "MOD-04", title: "Model Analytics", desc: "Compare quality, latency, and cost across every provider and model version.", span: "" },
  { icon: Building2, code: "MOD-05", title: "Department Analytics", desc: "Adoption, spend, and output broken down by org structure.", span: "" },
  { icon: TrendingUp, code: "MOD-06", title: "ROI Engine", desc: "Translate token consumption into hours saved, revenue impact, and defensible ROI figures.", span: "md:col-span-2" },
  { icon: LayoutDashboard, code: "MOD-07", title: "Executive Dashboard", desc: "Board-ready reporting on AI value, risk, and trend lines.", span: "" },
  { icon: ShieldCheck, code: "MOD-08", title: "AI Governance", desc: "Enforce usage policy at the gateway, not in a PDF.", span: "" },
  { icon: ScrollText, code: "MOD-09", title: "Audit Logs", desc: "Immutable, exportable record of every request and decision.", span: "" },
  { icon: KeyRound, code: "MOD-10", title: "Role-Based Access", desc: "Granular permissions mapped to your org chart and IdP.", span: "" },
  { icon: Lock, code: "MOD-11", title: "Security", desc: "Encryption in transit and at rest. Your data never trains a model.", span: "" },
  { icon: BellRing, code: "MOD-12", title: "Alerts", desc: "Budget overruns, shadow AI, and anomalous usage — flagged instantly.", span: "" },
];

const Features = () => (
  <SectionShell id="features" className="border-t border-hairline">
    <Reveal>
      <Chapter number="03" label="Capabilities" id="features" />
    </Reveal>
    <Reveal delay={0.1}>
      <h2 className="mt-10 max-w-3xl text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="features-headline">
        Twelve modules. <span className="text-accent">One source of truth</span> for enterprise AI.
      </h2>
    </Reveal>

    <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4" data-testid="features-grid">
      {FEATURES.map((f, i) => (
        <Reveal key={f.code} delay={(i % 4) * 0.06} className={f.span}>
          <div
            className="group relative h-full overflow-hidden border border-hairline bg-surface/40 p-7 transition-colors duration-500 hover:border-accent/50 hover:bg-surface"
            data-testid={`feature-card-${f.code.toLowerCase()}`}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 bg-[radial-gradient(circle,rgba(0,229,168,0.12)_0%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="flex items-center justify-between">
              <f.icon size={20} strokeWidth={1.5} className="text-text-secondary transition-colors duration-500 group-hover:text-accent" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-text-secondary/40">{f.code}</span>
            </div>
            <h3 className="mt-6 text-base font-medium tracking-tight text-text-primary">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </SectionShell>
);

export default Features;
