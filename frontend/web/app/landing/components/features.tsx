import { ArrowUpRight, Bot, Globe2, Inbox, Workflow, BarChart3, ShieldCheck } from "lucide-react";

export function Features() {
  const items = [
    {
      icon: Bot,
      title: "Autopilot agent",
      body: "Trains on your docs, macros, and past tickets in minutes. Resolves up to 72% of conversations without a human.",
      accent: "accent" as const,
    },
    {
      icon: Globe2,
      title: "Truly global, day one",
      body: "Detects language automatically and replies in 92 of them — with regional idioms your customers actually use.",
      accent: "coral" as const,
    },
    {
      icon: Inbox,
      title: "One inbox, every channel",
      body: "Web, WhatsApp, Instagram, email, SMS, Slack Connect. Threaded, deduplicated, searchable.",
      accent: "ink" as const,
    },
    {
      icon: Workflow,
      title: "Workflows without code",
      body: "Drag to route by intent, sentiment, plan tier, or continent. If/then, but it feels like Figma.",
      accent: "accent" as const,
    },
    {
      icon: BarChart3,
      title: "Analytics that answer why",
      body: "CSAT, resolution rate, first response time — plus AI summaries of what's actually driving your volume.",
      accent: "coral" as const,
    },
    {
      icon: ShieldCheck,
      title: "Enterprise-grade trust",
      body: "SOC 2 Type II, HIPAA, GDPR, EU data residency, SSO, RBAC. Audit logs on everything.",
      accent: "ink" as const,
    },
  ];

  return (
    <section id="product" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              &mdash; Product
            </p>
            <h2 className="max-w-2xl font-display text-5xl leading-[1] tracking-tight md:text-6xl">
              Everything a support team needs. <em className="italic text-muted-foreground">Nothing they don&apos;t.</em>
            </h2>
          </div>
          <a
            href="#tour"
            className="group flex items-center gap-2 text-sm font-medium text-ink"
          >
            <span className="relative">
              Take the full tour
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-ink transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
          {items.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="group relative flex flex-col gap-4 bg-background p-8 transition-colors duration-500 hover:bg-surface"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background:
                    accent === "accent"
                      ? "var(--accent)"
                      : accent === "coral"
                        ? "var(--coral)"
                        : "var(--ink)",
                  color:
                    accent === "accent"
                      ? "var(--accent-foreground)"
                      : "var(--primary-foreground)",
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl leading-tight tracking-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              <ArrowUpRight className="absolute right-6 top-6 h-4 w-4 text-muted-foreground opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
