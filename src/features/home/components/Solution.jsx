import { motion } from "framer-motion";
import { User, ShieldCheck, Cloud, BarChart3, Calculator, TrendingUp, LayoutDashboard } from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const NODES = [
  { icon: User, label: "Employee", sub: "Every request captured" },
  { icon: ShieldCheck, label: "AI Gateway", sub: "Policy + governance" },
  { icon: Cloud, label: "AI Providers", sub: "OpenAI · Anthropic · Gemini" },
  { icon: BarChart3, label: "Usage Engine", sub: "Token-level telemetry" },
  { icon: Calculator, label: "Cost Engine", sub: "Real-time attribution" },
  { icon: TrendingUp, label: "ROI Engine", sub: "Value measurement" },
  { icon: LayoutDashboard, label: "Executive Dashboard", sub: "Board-ready insight" },
];

const Connector = () => (
  <>
    {/* Mobile vertical line */}
    <div className="relative mx-auto h-10 w-px bg-hairline lg:hidden">
      <motion.span
        className="absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(0,229,168,0.9)]"
        animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        style={{ left: "-2.5px" }}
      />
    </div>
    {/* Desktop horizontal line */}
    <div className="relative hidden h-px flex-1 bg-hairline lg:block">
      <motion.span
        className="absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(0,229,168,0.9)]"
        animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        style={{ top: "-2.5px" }}
      />
    </div>
  </>
);

const Solution = () => (
  <SectionShell id="solution" className="border-t border-hairline bg-surface/20">
    <Reveal>
      <Chapter number="02" label="The Platform" id="solution" />
    </Reveal>
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end">
      <Reveal delay={0.1}>
        <h2 className="text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="solution-headline">
          One Platform. <span className="text-accent">Complete AI Intelligence.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="max-w-xl text-base leading-relaxed text-text-secondary md:text-lg lg:ml-auto">
          IntelliROI sits between your workforce and every AI provider — an
          intelligent gateway that turns raw token traffic into governed,
          measurable business outcomes.
        </p>
      </Reveal>
    </div>

    <Reveal delay={0.25}>
      <div
        className="mt-16 flex flex-col items-stretch gap-0 lg:flex-row lg:items-center"
        data-testid="solution-pipeline"
      >
        {NODES.map((n, i) => (
          <div key={n.label} className="contents">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative flex-1 border border-hairline bg-ink p-5 transition-colors duration-500 hover:border-accent/50"
              data-testid={`pipeline-node-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span className="absolute right-3 top-3 font-mono text-[9px] text-text-secondary/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <n.icon size={20} strokeWidth={1.5} className="text-accent" />
              <div className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-text-primary">
                {n.label}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-text-secondary">{n.sub}</div>
            </motion.div>
            {i < NODES.length - 1 && <Connector />}
          </div>
        ))}
      </div>
    </Reveal>

    <Reveal delay={0.3}>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border border-hairline bg-ink px-6 py-4" data-testid="solution-metrics-strip">
        {[
          ["LATENCY OVERHEAD", "< 12ms"],
          ["PROVIDERS SUPPORTED", "40+"],
          ["DATA RESIDENCY", "YOUR VPC"],
          ["DEPLOYMENT", "24 HOURS"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">{k}</span>
            <span className="font-mono text-xs text-accent">{v}</span>
          </div>
        ))}
      </div>
    </Reveal>
  </SectionShell>
);

export default Solution;
