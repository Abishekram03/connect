import { ArrowRight, Sparkles } from "lucide-react";
import { MagneticButton } from "./magnetic-button";

export function ProductSection() {
  return (
    <section className="bg-ink px-6 py-32 text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground/50">
            &mdash; Autopilot
          </p>
          <h2 className="font-display text-5xl leading-[1] tracking-tight md:text-6xl">
            The AI teammate that reads your docs,{" "}
            <span className="text-accent italic">not just your greetings.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-primary-foreground/70">
            Point Connect at your help center, Notion, and Slack. It builds a knowledge graph in
            under an hour &mdash; and cites its sources on every reply so your team can trust it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton variant="accent" className="px-6 py-3" as="a" href="/signup">
              See it live <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              className="border border-white/20 px-6 py-3 text-primary-foreground hover:bg-white/5"
            >
              Read the docs
            </MagneticButton>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { k: "72%", v: "Auto-resolution" },
              { k: "12s", v: "Median reply time" },
              { k: "92", v: "Languages" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-4xl tracking-tight text-accent">{s.k}</div>
                <div className="mt-1 text-xs text-primary-foreground/60">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-accent/20 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-xs text-primary-foreground/60">
              <Sparkles className="h-3.5 w-3.5 text-accent" fill="var(--accent)" />
              <span>Sources &middot; 3</span>
            </div>
            <div className="space-y-3">
              {[
                { t: "returns-policy.md", h: "Refunds are auto-approved for orders under €200 within 30 days." },
                { t: "shipping-eu.notion", h: "Berlin hub cutoff is 14:00 CET. Delays flagged automatically to inbox." },
                { t: "vip-macros.yaml", h: "For customers with LTV > €500, offer store credit + 10% next order." },
              ].map((s) => (
                <div
                  key={s.t}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-accent/50"
                >
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                    {s.t}
                  </div>
                  <div className="text-sm text-primary-foreground/80">{s.h}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
              <span className="font-medium">Draft reply generated</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
