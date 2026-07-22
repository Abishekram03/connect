"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ConnectMark } from "./connect-mark";
import { MagneticButton } from "./magnetic-button";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = ["Product", "Solutions", "Pricing", "Customers", "Changelog"];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/">
          <ConnectMark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((it) => (
            <a
              key={it}
              href={`#${it.toLowerCase()}`}
              className="group relative rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-ink"
            >
              <span className="relative z-10">{it}</span>
              <span className="absolute inset-0 -z-0 scale-90 rounded-full bg-surface-2 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="hidden text-sm text-muted-foreground hover:text-ink md:inline-block"
          >
            Sign in
          </Link>
          <MagneticButton variant="primary" strength={0.25} className="px-5 py-2.5" as="a" href="/signup">
            Start free <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
