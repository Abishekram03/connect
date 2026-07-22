export function LogoMarquee() {
  const brands = [
    "NORTHWIND",
    "Kōbo",
    "LUMEN.",
    "arcadia",
    "PALO ALTO",
    "meridian",
    "OKAPI",
    "Fjord//",
    "STRATA",
    "helios",
  ];
  return (
    <section className="border-y border-border bg-surface py-10">
      <div className="mx-auto mb-6 max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Trusted by 4,200+ teams shipping worldwide
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap px-8">
          {[...brands, ...brands].map((b, i) => (
            <span
              key={i}
              className="font-display text-3xl tracking-tight text-muted-foreground/60"
            >
              {b}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent" />
      </div>
    </section>
  );
}
