import { ArrowRight, ArrowUpRight, Languages, Sparkles, Zap } from "lucide-react";
import { MagneticButton } from "./magnetic-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24 grain-bg">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-[300px] w-[300px] rounded-full bg-coral/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-accent" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            New &mdash; Voice AI agent in beta
          </span>
          <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
        </div>

        <h1 className="mx-auto max-w-5xl text-center font-display text-6xl leading-[0.95] tracking-tight text-ink md:text-8xl">
          Support that <em className="italic text-muted-foreground">actually</em> <br />
          talks like a{" "}
          <span className="relative inline-block">
            human.
            <svg
              className="absolute -bottom-3 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8 Q75 2 150 6 T298 4"
                stroke="var(--accent)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground md:text-xl">
          Connect is the AI-native support platform for global teams. Resolve tickets in 90+
          languages, deflect the boring ones, and keep every reply on-brand &mdash; from S&atilde;o
          Paulo to Seoul.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton variant="accent" className="px-7 py-4 text-base" as="a" href="/signup">
            Start for free <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton variant="outline" className="px-7 py-4 text-base">
            Watch 2-min tour
          </MagneticButton>
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Free 14-day trial &middot; No credit card &middot; Migrates from Intercom in one click
        </p>

        <HeroProductFrame />
      </div>
    </section>
  );
}

function HeroProductFrame() {
  const messages = [
    { from: "user" as const, text: "Hey — my last order hasn't shipped yet", lang: "EN" },
    { from: "ai" as const, text: "I see it — order #A-4821. Shipping delay from our Berlin hub, arriving Thursday. Want me to refund the express fee?" },
    { from: "user" as const, text: "Merci beaucoup, oui !", lang: "FR" },
    { from: "ai" as const, text: "Fait. €4.90 remboursés sur votre carte se terminant par 4429. Bonne journée !" },
  ];

  return (
    <div className="relative mx-auto mt-16 max-w-5xl float-in">
      <div className="pointer-events-none absolute -left-4 top-16 z-20 hidden rotate-[-6deg] rounded-2xl border border-border bg-background px-4 py-3 shadow-xl md:block">
        <div className="flex items-center gap-2 text-xs">
          <Zap className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-medium">Resolved in 12s</span>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-2 top-40 z-20 hidden rotate-[4deg] rounded-2xl border border-border bg-ink px-4 py-3 text-primary-foreground shadow-xl md:block">
        <div className="flex items-center gap-2 text-xs">
          <Languages className="h-3.5 w-3.5" />
          <span className="font-medium">Auto-translated &middot; FR &rarr; EN</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-border bg-background/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-surface-2" />
            <div className="h-2.5 w-2.5 rounded-full bg-surface-2" />
            <div className="h-2.5 w-2.5 rounded-full bg-surface-2" />
          </div>
          <div className="rounded-full bg-surface-2 px-3 py-1 font-mono text-[10px] text-muted-foreground">
            connect.app / inbox / conversation-4821
          </div>
          <div className="w-16" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_240px]">
          <aside className="hidden border-r border-border bg-background/40 p-4 md:block">
            <div className="mb-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Inbox &middot; 47
            </div>
            {["Amelia · Berlin", "Kenji · Tokyo", "Sara · Cairo", "Diego · Madrid", "Priya · Mumbai"].map((n, i) => (
              <div
                key={n}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${i === 0 ? "bg-accent/20 text-ink" : "text-muted-foreground"}`}
              >
                <div className="h-6 w-6 rounded-full bg-surface-2" />
                <div className="flex-1 truncate">{n}</div>
                {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </div>
            ))}
          </aside>

          <div className="min-h-[380px] space-y-4 p-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`msg-in flex ${m.from === "user" ? "justify-start" : "justify-end"}`}
                style={{ animationDelay: `${i * 0.18}s` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "rounded-tl-sm bg-surface-2 text-ink"
                      : "rounded-tr-sm bg-ink text-primary-foreground"
                  }`}
                >
                  {m.lang && (
                    <div className="mb-1 font-mono text-[9px] uppercase tracking-widest opacity-60">
                      {m.lang}
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            <div className="msg-in flex justify-end" style={{ animationDelay: "0.9s" }}>
              <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-ink px-4 py-3">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-primary-foreground"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-primary-foreground"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>

          <aside className="hidden border-l border-border bg-background/40 p-5 md:block">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" fill="var(--accent)" />
              <span className="text-xs font-medium">Connect AI</span>
            </div>
            <div className="mb-4 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted-foreground">
              Customer is a repeat buyer (12 orders). Sentiment: <span className="text-ink">calm</span>. Suggested action: refund express fee.
            </div>
            <div className="space-y-2">
              {["Refund express fee", "Escalate to human", "Send tracking link"].map((a) => (
                <button
                  key={a}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-xs transition-colors hover:border-ink hover:bg-surface"
                >
                  {a}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
