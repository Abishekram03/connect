export function Metrics() {
  return (
    <section className="border-y border-border bg-surface px-6 py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
        {[
          { k: "4.2M", v: "Conversations resolved / month" },
          { k: "72%", v: "Deflected without a human" },
          { k: "92", v: "Languages, natively" },
          { k: "4.9★", v: "Median CSAT score" },
        ].map((s) => (
          <div key={s.v}>
            <div className="font-display text-6xl tracking-tight text-ink">{s.k}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
