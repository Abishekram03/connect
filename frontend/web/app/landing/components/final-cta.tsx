"use client";

import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "./magnetic-button";

export function FinalCTA() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <section className="px-6 pb-24 pt-16">
      <div
        ref={wrapperRef}
        onMouseMove={(e) => {
          const r = wrapperRef.current?.getBoundingClientRect();
          if (!r) return;
          setPos({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-ink px-8 py-24 text-center text-primary-foreground md:px-16 md:py-32"
        style={{
          backgroundImage: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, oklch(0.9 0.19 125 / 0.35), transparent 60%)`,
        }}
      >
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground/60">
          &mdash; Ready?
        </p>
        <h2 className="mx-auto max-w-3xl font-display text-6xl leading-[0.95] tracking-tight md:text-8xl">
          Give your support team <em className="italic text-accent">superpowers.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70">
          14 days free. Migrate from Intercom or Crisp with one click. Cancel with two.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton variant="accent" className="px-8 py-4 text-base" as="a" href="/signup">
            Start for free <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton
            variant="ghost"
            className="border border-white/20 px-8 py-4 text-base text-primary-foreground hover:bg-white/5"
          >
            Book a demo
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
