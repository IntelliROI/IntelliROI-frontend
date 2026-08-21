import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal, Chapter, SectionShell, CountUp } from "./shared";

const trend = [
  { m: "AUG", cost: 210, value: 940 }, { m: "SEP", cost: 248, value: 1210 },
  { m: "OCT", cost: 232, value: 1480 }, { m: "NOV", cost: 290, value: 1890 },
  { m: "DEC", cost: 268, value: 2140 }, { m: "JAN", cost: 324, value: 2680 },
  { m: "FEB", cost: 356, value: 3120 }, { m: "MAR", cost: 342, value: 3560 },
  { m: "APR", cost: 388, value: 3980 }, { m: "MAY", cost: 402, value: 4410 },
  { m: "JUN", cost: 396, value: 4820 }, { m: "JUL", cost: 5240, value: 5240 },
];

const providers = [
  { name: "OPENAI", pct: 44, color: "#00E5A8" },
  { name: "ANTHROPIC", pct: 31, color: "#4F8CFF" },
  { name: "GOOGLE", pct: 17, color: "#F59E0B" },
  { name: "BEDROCK", pct: 8, color: "#CBD5E1" },
];

const depts = [
  { name: "ENGINEERING", spend: 148200, roi: "912%" },
  { name: "PRODUCT", spend: 96700, roi: "744%" },
  { name: "CUSTOMER SUPPORT", spend: 61300, roi: "688%" },
  { name: "SALES", spend: 44900, roi: "531%" },
  { name: "MARKETING", spend: 38200, roi: "472%" },
];

const recos = [
  "Shift 18% of GPT-5.4 traffic to GPT-5.4-mini for summarization — projected save $21.4K/mo.",
  "Marketing holds 34 idle Enterprise seats — reclaim $6.8K/mo.",
  "Support ROI inflecting: expand Claude deployment to tier-2 queues.",
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-hairline bg-ink px-3 py-2 font-mono text-[10px]">
      <div className="text-text-secondary">{label} 2026</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === "cost" ? "COST" : "VALUE"}: ${p.value}K
        </div>
      ))}
    </div>
  );
};

const DashboardSection = () => (
  <SectionShell id="dashboard" className="border-t border-hairline bg-surface/20">
    <Reveal>
      <Chapter number="04" label="Command Center" id="dashboard" />
    </Reveal>
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end">
      <Reveal delay={0.1}>
        <h2 className="text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="dashboard-headline">
          The executive dashboard for <span className="text-accent">the AI balance sheet.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="max-w-xl text-base leading-relaxed text-text-secondary md:text-lg lg:ml-auto">
          Bloomberg-terminal density, Linear-grade polish. Every token, dollar,
          and hour — reconciled in one view your board will actually read.
        </p>
      </Reveal>
    </div>

    <Reveal delay={0.25}>
      <div className="mt-16 border border-hairline bg-ink shadow-[0_0_100px_rgba(0,229,168,0.06)]" data-testid="dashboard-preview">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary">
              INTELLIROI / EXECUTIVE
            </span>
            <span className="hidden font-mono text-[10px] text-text-secondary sm:block">FY-2026 · Q3</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            Streaming
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-hairline border-b border-hairline lg:grid-cols-4">
          {[
            { label: "TOKEN USAGE / MO", v: 2.4, suffix: "B", d: 1, delta: "+9.2%" },
            { label: "AI SPEND / MO", v: 412840, prefix: "$", d: 0, delta: "+6.8%" },
            { label: "BUSINESS VALUE / MO", v: 3800000, prefix: "$", suffix: "", d: 0, delta: "+18.4%", compact: true },
            { label: "TIME SAVED / MO", v: 12840, suffix: "h", d: 0, delta: "+11.1%" },
          ].map((s) => (
            <div key={s.label} className="px-5 py-5" data-testid={`dash-stat-${s.label.toLowerCase().replace(/[\s/]+/g, "-")}`}>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">{s.label}</div>
              <div className="mt-2 font-mono text-xl font-light text-text-primary md:text-2xl">
                <CountUp
                  value={s.compact ? s.v / 1000000 : s.v}
                  prefix={s.prefix || ""}
                  suffix={s.compact ? "M" : s.suffix || ""}
                  decimals={s.compact ? 1 : s.d}
                />
              </div>
              <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-accent">
                <ArrowUpRight size={10} strokeWidth={2} /> {s.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="border-b border-hairline p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                COST VS BUSINESS VALUE — TRAILING 12M
              </span>
              <div className="flex items-center gap-4 font-mono text-[9px] text-text-secondary">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-accent" /> VALUE</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-accent-blue" /> COST</span>
              </div>
            </div>
            <div className="h-[260px]" data-testid="dash-trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E5A8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00E5A8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fill: "#CBD5E1", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#2A2A2A" }} tickLine={false} />
                  <YAxis tick={{ fill: "#CBD5E1", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2A2A2A" }} />
                  <Area type="monotone" dataKey="value" stroke="#00E5A8" strokeWidth={1.5} fill="url(#valGrad)" />
                  <Area type="monotone" dataKey="cost" stroke="#4F8CFF" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              PROVIDER DISTRIBUTION
            </div>
            <div className="space-y-3" data-testid="dash-provider-distribution">
              {providers.map((p) => (
                <div key={p.name}>
                  <div className="mb-1 flex justify-between font-mono text-[10px]">
                    <span className="text-text-primary">{p.name}</span>
                    <span className="text-text-secondary">{p.pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-hairline">
                    <div className="h-1 transition-[width] duration-1000" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              DEPARTMENT SPEND
            </div>
            <div className="space-y-2" data-testid="dash-department-spend">
              {depts.map((d) => (
                <div key={d.name} className="flex items-center justify-between border-b border-hairline/50 pb-2 font-mono text-[10px]">
                  <span className="text-text-primary">{d.name}</span>
                  <span className="text-text-secondary">${(d.spend / 1000).toFixed(1)}K</span>
                  <span className="text-[#00E5A8]">{d.roi}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-hairline p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            <Sparkles size={12} strokeWidth={1.5} /> Executive Recommendations
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3" data-testid="dash-recommendations">
            {recos.map((r, i) => (
              <div key={i} className="border border-hairline bg-surface/40 p-4 text-xs leading-relaxed text-text-secondary">
                <span className="mb-2 block font-mono text-[9px] text-accent">RECO-{String(i + 1).padStart(2, "0")}</span>
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  </SectionShell>
);

export default DashboardSection;
