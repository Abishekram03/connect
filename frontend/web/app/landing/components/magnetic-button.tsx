"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "accent" | "ghost" | "outline";
  as?: "button" | "a";
  href?: string;
  onClick?: () => void;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  variant = "primary",
  as = "button",
  href,
  onClick,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inner = useRef<HTMLSpanElement | null>(null);

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    if (inner.current) {
      inner.current.style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`;
    }
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
    if (inner.current) inner.current.style.transform = "translate(0,0)";
  };

  const variants: Record<string, string> = {
    primary: "bg-ink text-primary-foreground hover:bg-ink/90",
    accent: "bg-accent text-accent-foreground shadow-[0_10px_40px_-10px_var(--accent)]",
    ghost: "bg-transparent text-ink hover:bg-surface-2",
    outline: "bg-transparent text-ink border border-ink/20 hover:border-ink",
  };

  const cls = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform select-none",
    variants[variant],
    className,
  );

  const content = (
    <span
      ref={inner}
      className="inline-flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      {children}
    </span>
  );

  if (as === "a") {
    return (
      <a
        ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={cls}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as unknown as React.RefObject<HTMLButtonElement>}
      className={cls}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}
