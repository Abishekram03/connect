"use client";

import { Check } from "lucide-react";
import { MagneticButton } from "./magnetic-button";

export function Pricing() {
  const tiers = [
    {
      name: "Growth",
      price: "$49",
      per: "/seat/mo",
      note: "For scaling teams",
      feats: ["AI autopilot", "Unlimited channels", "50 languages", "Workflows + API", "SLA reporting", "Email support"],
      cta: "Start 14-day trial",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      price: "$99",
      per: "/seat/mo",
      note: "For support leaders",
      feats: ["Everything in Growth", "Custom AI training", "Priority routing", "Advanced analytics", "SSO", "Priority support"],
      cta: "Start 14-day trial",
      variant: "accent" as const,
      featured: true,
    },
    {
      name: "Business",
      price: "Custom",
      note: "Compliance + volume",
      feats: ["SOC 2 · HIPAA · GDPR", "EU data residency", "SCIM provisioning", "Dedicated CSM", "99.99% uptime SLA"],
      cta: "Talk to sales",
      variant: "primary" as const,
    },
  ];

  return (
    <section id="pricing" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            &mdash; Pricing
          </p>
          <h2 className="font-display text-5xl leading-[1] tracking-tight md:text-6xl">
            Fair, transparent, <em className="italic text-muted-foreground">no per-message surprises.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-500 ${
                t.featured
                  ? "border-ink bg-ink text-primary-foreground md:-translate-y-4"
                  : "border-border bg-background hover:border-ink"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  Most popular
                </span>
              )}
              <div className="mb-6">
                <div
                  className={`font-mono text-xs uppercase tracking-widest ${t.featured ? "text-accent" : "text-muted-foreground"}`}
                >
                  {t.name}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-6xl tracking-tight">{t.price}</span>
                  {t.per && (
                    <span
                      className={`text-sm ${t.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                    >
                      {t.per}
                    </span>
                  )}
                </div>
                <div
                  className={`mt-2 text-sm ${t.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                >
                  {t.note}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {t.feats.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${t.featured ? "text-accent" : "text-ink"}`}
                    />
                    <span className={t.featured ? "text-primary-foreground/80" : ""}>{f}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton
                variant={t.variant}
                strength={0.2}
                className="w-full justify-center"
              >
                {t.cta}
              </MagneticButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
