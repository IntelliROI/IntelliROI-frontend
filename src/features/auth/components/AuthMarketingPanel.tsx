"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import anime from "animejs";
import { Activity, BarChart3, Gauge, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type CopySlide = {
  kind: "copy";
  eyebrow: string;
  title: string;
  body: string;
  icon: typeof BarChart3;
};

type RoiSlide = {
  kind: "roi";
  eyebrow: string;
};

const SLIDES: Array<CopySlide | RoiSlide> = [
  {
    kind: "copy",
    eyebrow: "01 — Intelligence",
    title: "Scale, measure, and govern AI",
    body: "Every prompt attributed. Every dollar visible. Estimated ROI rolled up through your org hierarchy.",
    icon: BarChart3,
  },
  {
    kind: "copy",
    eyebrow: "02 — Security",
    title: "Enterprise access, locked down",
    body: "Tenant isolation, role-scoped dashboards, and audit trails so AI usage stays accountable.",
    icon: ShieldCheck,
  },
  {
    kind: "copy",
    eyebrow: "03 — Operations",
    title: "Gateway → cost → Estimated ROI",
    body: "Route usage through IntelliROI, meter tokens, and convert spend into executive-grade signal.",
    icon: Gauge,
  },
  {
    kind: "roi",
    eyebrow: "04 — Company ROI",
  },
];

const DEPT_BARS = [
  { name: "Engineering", width: "82%" },
  { name: "Product", width: "64%" },
  { name: "Support", width: "48%" },
] as const;

function CompanyRoiCard() {
  return (
    <div className="border border-hairline bg-ink/90 p-3">
      <div className="mb-3 flex items-center justify-between border-b border-hairline pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Company ROI
        </span>
        <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px border border-hairline bg-hairline">
        {[
          ["Est. ROI", "804%"],
          ["Spend", "$412K"],
          ["Tokens", "2.4B"],
        ].map(([label, value]) => (
          <div key={label} className="bg-ink px-2.5 py-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-secondary/60">
              {label}
            </p>
            <p className="mt-1.5 font-mono text-base font-light text-accent">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {DEPT_BARS.map((dept) => (
          <div
            key={dept.name}
            className="flex items-center gap-3 border border-hairline bg-ink/80 px-3 py-2"
          >
            <Activity size={14} strokeWidth={1.5} className="text-accent" />
            <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-primary">
              {dept.name}
            </span>
            <div className="h-1 w-16 bg-hairline sm:w-20">
              <div className="h-1 bg-accent" style={{ width: dept.width }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * One viewport-fit frame. Wheel / dots: 01–03 copy → 04 Company ROI table.
 */
export function AuthMarketingPanel() {
  const [index, setIndex] = useState(0);
  const copyRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);

  const goTo = useCallback((next: number) => {
    const clamped = Math.min(Math.max(next, 0), SLIDES.length - 1);
    setIndex(clamped);
  }, []);

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    anime.remove(el);
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 320,
      easing: "easeOutExpo",
    });
  }, [index]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      lockRef.current = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return 0;
        if (next >= SLIDES.length) return SLIDES.length - 1;
        return next;
      });
      window.setTimeout(() => {
        lockRef.current = false;
      }, 500);
    };

    const root = document.getElementById("auth-marketing-frame");
    root?.addEventListener("wheel", onWheel, { passive: false });
    return () => root?.removeEventListener("wheel", onWheel);
  }, []);

  const slide = SLIDES[index]!;

  return (
    <aside className="relative hidden h-full min-h-0 w-full flex-col overflow-hidden border-r border-hairline bg-ink lg:flex">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 28% 18%, rgba(0,229,168,0.12) 0%, transparent 58%)",
        }}
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col px-10 py-8 xl:px-16 xl:py-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
            <span className="h-2 w-2 bg-accent" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-[0.2em] text-text-primary">
            INTELLIROI
          </span>
        </Link>

        <div
          id="auth-marketing-frame"
          className="flex min-h-0 flex-1 flex-col justify-center py-10"
        >
          <div ref={copyRef} className="w-full max-w-xl">
            {slide.kind === "roi" ? (
              <>
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                  {slide.eyebrow}
                </p>
                <CompanyRoiCard />
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                  {slide.eyebrow}
                </p>
                <div className="mt-6 flex items-start gap-4">
                  <slide.icon
                    size={24}
                    strokeWidth={1.5}
                    className="mt-1.5 shrink-0 text-accent"
                  />
                  <div>
                    <h2 className="text-3xl font-light tracking-tight text-text-primary xl:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary">
                      {slide.body}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-12 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 transition-all duration-300",
                  i === index
                    ? "w-8 bg-accent"
                    : "w-1.5 bg-text-secondary/30 hover:bg-text-secondary/50",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
