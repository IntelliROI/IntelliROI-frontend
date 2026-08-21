import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Play, ArrowUpRight as Delta } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { CountUp } from "./shared";

const spark = [
  { v: 12 }, { v: 18 }, { v: 15 }, { v: 24 }, { v: 21 }, { v: 32 },
  { v: 28 }, { v: 40 }, { v: 37 }, { v: 48 }, { v: 44 }, { v: 58 },
];

const rows = [
  { dept: "ENGINEERING", model: "GPT-5.4", cost: "$148.2K", delta: "+12.4%" },
  { dept: "PRODUCT", model: "CLAUDE-4.6", cost: "$96.7K", delta: "+8.1%" },
  { dept: "SUPPORT", model: "GEMINI-3.1", cost: "$61.3K", delta: "-3.2%" },
  { dept: "SALES", model: "GPT-5.4-MINI", cost: "$44.9K", delta: "+21.7%" },
];

const MaskedLine = ({ children, delay }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className="block"
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const dashY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-[72px]" data-testid="hero-section">
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-[-20%] h-[700px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,229,168,0.09)_0%,rgba(9,9,11,0)_65%)]" />
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
      </motion.div>

      <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 md:px-12 lg:grid-cols-2 lg:pb-32 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex items-center gap-3"
            data-testid="hero-overline"
          >
            <span className="flex items-center gap-2 border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
              Enterprise AI Intelligence OS
            </span>
          </motion.div>

          <h1
            className="text-5xl font-light leading-[0.98] tracking-tighter text-text-primary sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
            data-testid="hero-headline"
          >
            <MaskedLine delay={0.2}>Measure</MaskedLine>
            <MaskedLine delay={0.32}>
              Every <span className="text-accent">AI</span>
            </MaskedLine>
            <MaskedLine delay={0.44}>
              Dollar<span className="text-accent">.</span>
            </MaskedLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg"
            data-testid="hero-subtitle"
          >
            Complete visibility into AI usage, token consumption, cost, governance,
            and ROI across your entire enterprise. Every token accountable. Every
            dollar visible.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/register-company"
              data-testid="hero-register-button"
              className="group flex items-center gap-2 border border-accent bg-accent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow-[0_0_40px_rgba(0,229,168,0.25)] transition-all duration-300 hover:bg-transparent hover:text-accent"
            >
              Register
              <ArrowUpRight size={15} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/login"
              data-testid="hero-login-button"
              className="group flex items-center gap-3 border border-hairline px-7 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-text-primary transition-colors duration-300 hover:border-accent/50 hover:text-accent"
            >
              <Play size={14} strokeWidth={1.5} className="text-accent" />
              Login
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-14 grid max-w-lg grid-cols-3 divide-x divide-hairline border-y border-hairline"
            data-testid="hero-stats"
          >
            {[
              { v: 2.4, suffix: "B", label: "Tokens Tracked / Mo", decimals: 1 },
              { v: 804, suffix: "%", label: "Avg. Measured ROI", decimals: 0 },
              { v: 38, suffix: "%", label: "Avg. Cost Reduction", decimals: 0 },
            ].map((s) => (
              <div key={s.label} className="px-4 py-5 first:pl-0">
                <div className="font-mono text-2xl font-light text-text-primary md:text-3xl">
                  <CountUp value={s.v} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          style={{ y: dashY }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          data-testid="hero-dashboard-preview"
        >
          <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(0,229,168,0.12)_0%,transparent_70%)]" />
          <div className="relative border border-hairline bg-ink shadow-[0_0_80px_rgba(0,229,168,0.08)]">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2A2A2A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#2A2A2A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                intelliROI / executive-overview
              </span>
              <span className="font-mono text-[10px] text-accent">LIVE</span>
            </div>

            <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
              {[
                { label: "AI SPEND / MO", v: 412840, prefix: "$", suffix: "" },
                { label: "MEASURED ROI", v: 804, prefix: "", suffix: "%" },
                { label: "HOURS SAVED", v: 12840, prefix: "", suffix: "" },
              ].map((s) => (
                <div key={s.label} className="px-4 py-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">
                    {s.label}
                  </div>
                  <div className="mt-1 font-mono text-lg text-accent md:text-xl">
                    <CountUp value={s.v} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-hairline p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">
                  BUSINESS VALUE GENERATED — 12M TREND
                </span>
                <span className="font-mono text-[10px] text-accent">▲ 214% YoY</span>
              </div>
              <div className="h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E5A8" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#00E5A8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#00E5A8" strokeWidth={1.5} fill="url(#heroGrad)" isAnimationActive />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">
                DEPARTMENT SPEND — REALTIME
              </div>
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <motion.div
                    key={r.dept}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.12, duration: 0.5 }}
                    className="flex items-center justify-between border border-hairline/60 bg-surface/40 px-3 py-2"
                  >
                    <span className="font-mono text-[10px] tracking-wider text-text-primary">{r.dept}</span>
                    <span className="hidden font-mono text-[10px] text-text-secondary sm:block">{r.model}</span>
                    <span className="font-mono text-[10px] text-text-primary">{r.cost}</span>
                    <span className={`flex items-center gap-1 font-mono text-[10px] ${r.delta.startsWith("-") ? "text-danger" : "text-accent"}`}>
                      <Delta size={10} strokeWidth={2} className={r.delta.startsWith("-") ? "rotate-90" : ""} />
                      {r.delta}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
