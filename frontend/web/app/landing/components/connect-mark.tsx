export function ConnectMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="10" cy="16" r="6" fill="currentColor" />
        <circle cx="22" cy="16" r="6" fill="var(--color-accent, oklch(0.9 0.19 125))" />
      </svg>
      <span className="font-display text-xl leading-none tracking-tight">Connect</span>
    </span>
  );
}
