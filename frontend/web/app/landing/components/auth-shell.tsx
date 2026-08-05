import type { ReactNode } from "react";
import Link from "next/link";
import { Bot, Globe, Inbox } from "lucide-react";
import { ConnectMark } from "./connect-mark";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const featureCards = [
  {
    icon: <Bot className="h-4 w-4" />,
    title: "AI Autopilot",
    body: "Draft replies, summarize conversations, and resolve the repetitive without losing the human tone.",
  },
  {
    icon: <Globe className="h-4 w-4" />,
    title: "50 languages, one inbox",
    body: "Talk to customers in their language — automatically detected, translated, and matched to your brand voice.",
  },
  {
    icon: <Inbox className="h-4 w-4" />,
    title: "Every channel together",
    body: "Email, chat, and social messages unified into a single workspace with shared context and history.",
  },
];

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-2">
      <div className="relative flex flex-col justify-between px-6 py-8 md:px-12">
        <Link href="/" className="w-fit">
          <ConnectMark />
        </Link>

        <div className="mx-auto w-full max-w-md py-16">
          <h1 className="font-display text-5xl leading-tight tracking-tight text-ink md:text-6xl">
            {title}
          </h1>
          <p className="mt-3 text-muted-foreground">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>

        <div className="text-xs text-muted-foreground">{footer}</div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block grain-bg">
        <div className="pointer-events-none absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-coral/25 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-accent live-dot" />
            Live &middot; 12,481 conversations resolved today
          </div>

          <div className="space-y-8">
            <div className="max-w-md space-y-4">
              <h2 className="font-display text-4xl leading-tight text-primary-foreground">
                Support at the speed of conversation.
              </h2>
              <p className="text-primary-foreground/60">
                An AI-native help desk that brings every channel into one inbox — so your team can resolve faster and stay personal.
              </p>
            </div>

            <div className="grid gap-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      {card.icon}
                    </span>
                    <div>
                      <div className="font-medium text-primary-foreground">{card.title}</div>
                      <div className="text-sm leading-relaxed text-primary-foreground/60">
                        {card.body}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-primary-foreground/60">
            <span className="font-semibold text-primary-foreground">14-day free trial.</span> No credit card required.
          </div>
        </div>
      </div>
    </div>
  );
}
