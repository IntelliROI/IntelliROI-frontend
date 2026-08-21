import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";

export const scrollToId = (hash) => {
  const el = document.querySelector(hash);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: "smooth" });
};

export const Reveal = ({ children, delay = 0, className = "", y = 30 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const CountUp = ({ value, prefix = "", suffix = "", decimals = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 18 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current)
          ref.current.textContent =
            prefix +
            v.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }) +
            suffix;
      }),
    [spring, prefix, suffix, decimals]
  );

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
};

export const Chapter = ({ number, label, id }) => (
  <div className="flex items-center gap-4" data-testid={`chapter-${id}`}>
    <span className="font-mono text-xs tracking-[0.25em] text-accent">{number}</span>
    <span className="h-px w-10 bg-hairline" />
    <span className="font-mono text-xs uppercase tracking-[0.25em] text-text-secondary">
      {label}
    </span>
  </div>
);

export const SectionShell = ({ id, children, className = "" }) => (
  <section id={id} className={`relative py-24 md:py-32 lg:py-36 ${className}`}>
    <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">{children}</div>
  </section>
);
