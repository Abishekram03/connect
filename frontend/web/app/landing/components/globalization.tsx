export function Globalization() {
  const langs = [
    { code: "EN", city: "New York", phrase: "How can I help?" },
    { code: "JA", city: "Tokyo", phrase: "どうされましたか？" },
    { code: "ES", city: "Madrid", phrase: "¿En qué te ayudo?" },
    { code: "AR", city: "Dubai", phrase: "كيف أساعدك؟" },
    { code: "DE", city: "Berlin", phrase: "Wie kann ich helfen?" },
    { code: "PT", city: "São Paulo", phrase: "Como posso ajudar?" },
    { code: "KO", city: "Seoul", phrase: "무엇을 도와드릴까요?" },
    { code: "FR", city: "Paris", phrase: "Comment puis-je aider ?" },
  ];

  return (
    <section id="solutions" className="px-6 py-32 grain-bg">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            &mdash; Global by default
          </p>
          <h2 className="font-display text-5xl leading-[1] tracking-tight md:text-6xl">
            Your customers don&apos;t all speak <em className="italic text-coral">the same language.</em>{" "}
            Your support shouldn&apos;t either.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {langs.map((l, i) => (
            <div
              key={l.code}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-500 hover:border-ink"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{l.city}</span>
                <span className="font-display text-2xl tracking-tight text-accent-foreground">
                  <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-medium">
                    {l.code}
                  </span>
                </span>
              </div>
              <p className="font-display text-xl leading-tight text-ink">{l.phrase}</p>
              <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-accent/0 transition-all duration-700 group-hover:bg-accent/30 group-hover:blur-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
