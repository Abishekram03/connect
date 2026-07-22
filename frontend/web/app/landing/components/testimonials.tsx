export function Testimonials() {
  const items = [
    {
      q: "We cut our first-response time from 8 hours to 40 seconds. Our EU customers thought we hired a night shift.",
      name: "Amelia Ross",
      role: "Head of CX, Northwind",
    },
    {
      q: "Connect replaced Intercom, Zendesk Answer Bot, and a translation vendor. Same month. Nothing broke.",
      name: "Kenji Watanabe",
      role: "COO, Kōbo",
    },
    {
      q: "The autopilot writes like our brand. It's a little uncanny. My team spends time on hard problems now.",
      name: "Diego Silva",
      role: "Support Lead, Meridian",
    },
  ];

  return (
    <section id="customers" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          &mdash; Loved by operators
        </p>
        <h2 className="mb-16 max-w-3xl font-display text-5xl leading-[1] tracking-tight md:text-6xl">
          Teams don&apos;t switch platforms for fun. <em className="italic text-muted-foreground">They switch for this.</em>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <figure
              key={i}
              className={`flex flex-col justify-between rounded-3xl border border-border p-8 transition-transform duration-500 hover:-rotate-1 ${
                i === 1 ? "bg-ink text-primary-foreground" : "bg-background"
              }`}
            >
              <blockquote
                className={`font-display text-2xl leading-tight tracking-tight ${
                  i === 1 ? "text-primary-foreground" : "text-ink"
                }`}
              >
                <span className={i === 1 ? "text-accent" : "text-coral"}>"</span>
                {t.q}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full ${i === 1 ? "bg-white/20" : "bg-surface-2"}`}
                />
                <div>
                  <div
                    className={`text-sm font-medium ${i === 1 ? "text-primary-foreground" : "text-ink"}`}
                  >
                    {t.name}
                  </div>
                  <div
                    className={`text-xs ${i === 1 ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                  >
                    {t.role}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
