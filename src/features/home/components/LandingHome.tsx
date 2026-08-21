"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Nav from "./Nav";
import Hero from "./Hero";
import Marquee from "./Marquee";
import Problem from "./Problem";
import Solution from "./Solution";
import Features from "./Features";
import DashboardSection from "./DashboardSection";
import ROICalculator from "./ROICalculator";
import Architecture from "./Architecture";
import Integrations from "./Integrations";
import Security from "./Security";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

/**
 * Full public marketing landing.
 * Mounted at `/` — Login → `/login`, Register → `/register-company`.
 */
export function LandingHome() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="landing-shell bg-ink font-sans text-text-primary antialiased">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <Solution />
        <Features />
        <DashboardSection />
        <ROICalculator />
        <Architecture />
        <Integrations />
        <Security />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </div>
  );
}
