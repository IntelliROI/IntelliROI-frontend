import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chapter, LiveDot } from "@/components/ui/panel";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-60" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,229,168,0.09) 0%, rgba(9,9,11,0) 65%)",
        }}
      />

      <header className="relative z-10 mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
            <span className="h-2 w-2 bg-accent" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-[0.2em]">
            INTELLIROI
          </span>
        </div>
        <LiveDot label="Systems Operational" />
      </header>

      <main className="relative z-10 mx-auto flex max-w-[1400px] flex-col justify-center px-6 pb-24 pt-16 md:px-12 md:pt-24">
        <Chapter number="00" label="Operating System" />
        <h1 className="mt-10 max-w-4xl text-5xl font-light leading-[0.98] tracking-tighter text-text-primary sm:text-6xl lg:text-7xl">
          Know if your AI spend is{" "}
          <span className="text-accent">actually worth it</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
          IntelliROI sits between your teams and AI providers — metering tokens,
          attributing cost, and converting usage into executive-grade ROI.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/login">
              Enter platform
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register-company">Register company</Link>
          </Button>
        </div>

        <div className="mt-20 grid max-w-4xl gap-px bg-hairline md:grid-cols-3">
          {[
            ["Gateway", "Every prompt routed, traced, and attributed"],
            ["Cost engine", "Versioned provider pricing → real currency"],
            ["ROI layer", "Time saved × hourly cost = business value"],
          ].map(([title, body], i) => (
            <div key={title} className="bg-ink p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                0{i + 1}
              </p>
              <h3 className="mt-4 font-medium tracking-tight text-text-primary">
                {title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
