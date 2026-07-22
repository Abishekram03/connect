import type { ReactNode } from "react";
import Link from "next/link";
import { ConnectMark } from "./connect-mark";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

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
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Live &middot; 12,481 conversations resolved today
          </div>

          <div className="space-y-6">
            <div className="max-w-md space-y-4">
              <div className="msg-in rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 text-sm backdrop-blur">
                Hola &mdash; mi pedido llega ma&ntilde;ana pero necesito cambiar la direcci&oacute;n.
              </div>
              <div
                className="msg-in ml-8 rounded-2xl rounded-br-sm bg-accent px-4 py-3 text-sm text-accent-foreground"
                style={{ animationDelay: "0.3s" }}
              >
                &iexcl;Claro! Ya actualic&eacute; la direcci&oacute;n de tu pedido #A-3241. Llegar&aacute; ma&ntilde;ana entre las
                10&ndash;12h a Calle Mayor 4. &iquest;Algo m&aacute;s?
              </div>
              <div
                className="msg-in flex w-fit items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs backdrop-blur"
                style={{ animationDelay: "0.6s" }}
              >
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>

            <blockquote className="max-w-md font-display text-3xl leading-snug text-primary-foreground">
              &ldquo;Connect resolves 74% of our tickets before a human sees them &mdash; in 22 languages.&rdquo;
            </blockquote>
            <div className="text-sm text-primary-foreground/60">
              Priya Shah &middot; Head of CX, Northwind
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
