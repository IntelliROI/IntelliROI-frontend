"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { scrollToId } from "./shared";

const LINKS = [
  { label: "Platform", hash: "#solution" },
  { label: "Intelligence", hash: "#dashboard" },
  { label: "ROI", hash: "#roi" },
  { label: "Integrations", hash: "#integrations" },
  { label: "Security", hash: "#security" },
  { label: "Pricing", hash: "#pricing" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, hash) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(hash);
  };

  return (
    <header
      data-testid="main-nav"
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-hairline bg-ink/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-6 md:px-12">
        <a
          href="#top"
          onClick={(e) => go(e, "#top")}
          data-testid="nav-logo"
          className="flex items-center gap-3"
        >
          <span className="flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
            <span className="h-2 w-2 bg-accent" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-[0.2em] text-text-primary">
            INTELLIROI
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" data-testid="nav-links">
          {LINKS.map((l) => (
            <a
              key={l.hash}
              href={l.hash}
              onClick={(e) => go(e, l.hash)}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary transition-colors duration-300 hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            Systems Operational
          </span>
          <Link
            href="/login"
            data-testid="nav-login-link"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary transition-colors duration-300 hover:text-text-primary"
          >
            Login
          </Link>
          <Link
            href="/register-company"
            data-testid="nav-register-link"
            className="group flex items-center gap-2 border border-accent bg-accent px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-transparent hover:text-accent"
          >
            Register
            <ArrowUpRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          className="text-text-primary lg:hidden"
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-hairline bg-ink/95 backdrop-blur-xl lg:hidden"
            data-testid="nav-mobile-menu"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {LINKS.map((l) => (
                <a
                  key={l.hash}
                  href={l.hash}
                  onClick={(e) => go(e, l.hash)}
                  className="border-b border-hairline/50 py-3 font-mono text-xs uppercase tracking-[0.2em] text-text-secondary hover:text-accent"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="border-b border-hairline/50 py-3 font-mono text-xs uppercase tracking-[0.2em] text-text-secondary hover:text-accent"
              >
                Login
              </Link>
              <Link
                href="/register-company"
                onClick={() => setOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 border border-accent bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink"
              >
                Register
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Nav;
