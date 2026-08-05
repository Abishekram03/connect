"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

export function ProductSection() {
  const cards = [
    {
      k: "docs",
      tag: "01 — Knowledge",
      title: "Reads your docs, not just your greetings.",
      body: "Point Connect at your help center, Notion, and Slack. It builds a knowledge graph in under an hour and cites its sources on every reply.",
      bullets: ["Help center + Notion + Slack sync", "Source citations on every answer", "Stale-answer detection"],
    },
    {
      k: "resolve",
      tag: "02 — Resolution",
      title: "Resolves the boring 70%, escalates the rest.",
      body: "Autopilot handles refunds, order status and how-tos end to end. Anything ambiguous lands in your inbox with a summary already written.",
      bullets: ["Actions with real API calls", "Confidence-based handoff", "Pre-written escalation summaries"],
    },
    {
      k: "tone",
      tag: "03 — Voice",
      title: "Sounds like your team, in 50 languages.",
      body: "Train tone from your best past replies. Connect matches register, length and formality — natively per language, not machine-translated.",
      bullets: ["Tone trained on your history", "Per-locale formality rules", "Brand guardrails + review queue"],
    },
  ];
  const [active, setActive] = useState(0);

  return (
    <section className="bg-ink px-6 py-32 text-primary-foreground">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground/50">— Autopilot</p>
        <h2 className="max-w-3xl font-display text-5xl leading-[1] tracking-tight md:text-6xl">
          The AI teammate that actually <span className="italic text-accent">does the work.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-primary-foreground/70">
          Three things Autopilot does the moment you connect your workspace — no prompt engineering,
          no playbooks to write.
        </p>

        <div className="mt-14 flex flex-col gap-3 md:flex-row md:h-[420px]">
          {cards.map((c, i) => {
            const open = active === i;
            return (
              <div
                key={c.k}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={0}
                className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border p-8 outline-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open
                    ? "md:flex-[2.4] border-accent/40 bg-white/[0.07]"
                    : "md:flex-[1] border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.25em] ${open ? "text-accent" : "text-primary-foreground/40"}`}>
                    {c.tag}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                      open ? "rotate-45 bg-accent text-accent-foreground" : "bg-white/10 text-primary-foreground/60"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-3xl leading-[1.05] tracking-tight">{c.title}</h3>
                  <div
                    className={`grid transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-md text-sm leading-relaxed text-primary-foreground/70">{c.body}</p>
                      <ul className="mt-5 space-y-2">
                        {c.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-sm text-primary-foreground/80">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
