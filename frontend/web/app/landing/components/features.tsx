import { Bot, Globe2, Inbox, Workflow, BarChart3, ShieldCheck } from "lucide-react";

export function Features() {
  const items = [
    { icon: Bot, title: "Autopilot agent", body: "Trains on your docs and past tickets in minutes. Handles the repetitive questions end to end, and pulls you in the moment it should.", accent: "accent", span: "md:col-span-3 md:row-span-2" },
    { icon: Globe2, title: "Truly global, day one", body: "Detects language automatically and replies in 50 of them — with regional idioms customers actually use.", accent: "coral", span: "md:col-span-3" },
    { icon: Inbox, title: "One inbox, every channel", body: "Web, WhatsApp, Instagram, email, SMS, Slack Connect. Threaded and searchable.", accent: "ink", span: "md:col-span-2" },
    { icon: Workflow, title: "Workflows without code", body: "Route by intent, sentiment, plan tier, or continent.", accent: "accent", span: "md:col-span-1" },
    { icon: BarChart3, title: "Analytics that answer why", body: "CSAT, resolution rate, first response time — plus AI summaries of what's driving your volume.", accent: "coral", span: "md:col-span-4" },
    { icon: ShieldCheck, title: "Enterprise-grade trust", body: "SOC 2 Type II, HIPAA, GDPR, EU residency, SSO, RBAC.", accent: "ink", span: "md:col-span-2" },
  ];

  return (
    <section id="product" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">— Product</p>
            <h2 className="max-w-2xl font-display text-5xl leading-[1] tracking-tight md:text-6xl">
              Everything a support team needs. <em className="italic text-muted-foreground">Nothing they don&apos;t.</em>
            </h2>
          </div>
        </div>
        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-3 md:grid-cols-6">
          {items.map(({ icon: Icon, title, body, accent, span }) => (
            <div
              key={title}
              className={`group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-background p-8 transition-all duration-500 hover:border-ink hover:bg-surface ${span}`}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:rotate-6"
                style={{
                  background: accent === "accent" ? "var(--color-accent)" : accent === "coral" ? "var(--color-coral)" : "var(--color-ink)",
                  color: accent === "accent" ? "var(--color-accent-foreground)" : "var(--color-primary-foreground)",
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl leading-tight tracking-tight">{title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
