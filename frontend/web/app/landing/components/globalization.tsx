"use client";

import { useState } from "react";

const LANGUAGES: [string, string][] = [
  ["sq", "Albanian"], ["ar", "Arabic"], ["az", "Azerbaijani"], ["eu", "Basque"], ["bn", "Bengali"],
  ["bg", "Bulgarian"], ["ca", "Catalan"], ["zh-Hans", "Chinese"], ["zh-Hant", "Chinese (traditional)"],
  ["cs", "Czech"], ["da", "Danish"], ["nl", "Dutch"], ["en", "English"], ["eo", "Esperanto"],
  ["et", "Estonian"], ["fi", "Finnish"], ["fr", "French"], ["gl", "Galician"], ["de", "German"],
  ["el", "Greek"], ["he", "Hebrew"], ["hi", "Hindi"], ["hu", "Hungarian"], ["id", "Indonesian"],
  ["ga", "Irish"], ["it", "Italian"], ["ja", "Japanese"], ["ko", "Korean"], ["ky", "Kyrgyz"],
  ["lv", "Latvian"], ["lt", "Lithuanian"], ["ms", "Malay"], ["nb", "Norwegian"], ["fa", "Persian"],
  ["pl", "Polish"], ["pt", "Portuguese"], ["pt-BR", "Portuguese (Brazil)"], ["ro", "Romanian"],
  ["ru", "Russian"], ["sk", "Slovak"], ["sl", "Slovenian"], ["es", "Spanish"], ["sw", "Swahili"],
  ["sv", "Swedish"], ["tl", "Tagalog"], ["th", "Thai"], ["tr", "Turkish"], ["uk", "Ukranian"],
  ["ur", "Urdu"], ["vi", "Vietnamese"],
];

export function Globalization() {
  const phrases = [
    { code: "ja", city: "Tokyo", text: "どうされましたか？" },
    { code: "es", city: "Madrid", text: "¿En qué te ayudo?" },
    { code: "ar", city: "Dubai", text: "كيف أساعدك؟" },
    { code: "pt-BR", city: "São Paulo", text: "Como posso ajudar?" },
    { code: "ko", city: "Seoul", text: "무엇을 도와드릴까요?" },
    { code: "de", city: "Berlin", text: "Wie kann ich helfen?" },
  ];
  const [hover, setHover] = useState<string | null>(null);

  return (
    <section id="solutions" className="relative overflow-hidden bg-ink px-6 py-32 text-primary-foreground">
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-24">
          {/* Left — sticky editorial column */}
          <div className="lg:sticky lg:top-28 lg:h-fit lg:w-[38%]">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground/50">
              — Global by default
            </p>
            <h2 className="font-display text-5xl leading-[1] tracking-tight md:text-6xl">
              Fifty languages. <em className="italic text-accent">One voice.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-primary-foreground/70">
              Connect detects the language of every inbound message and answers natively — same tone,
              same accuracy, same second. No translation vendor, no night shift.
            </p>

            <div className="mt-10 flex items-baseline gap-6 border-t border-white/10 pt-8">
              <div>
                <div className="font-display text-6xl leading-none tracking-tight text-accent">50</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-primary-foreground/50">Languages live</div>
              </div>
              <div>
                <div className="font-display text-6xl leading-none tracking-tight">0</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-primary-foreground/50">Translation layers</div>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              {phrases.slice(0, 3).map((p) => (
                <div key={p.code} className="flex items-baseline gap-4">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-accent">{p.code}</span>
                  <span className="font-display text-xl leading-snug">{p.text}</span>
                  <span className="ml-auto font-mono text-[11px] text-primary-foreground/40">{p.city}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — the ledger */}
          <div className="flex-1">
            <div className="mb-5 flex items-baseline justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary-foreground/40">
                Supported locales
              </span>
              <span className="font-mono text-[11px] text-primary-foreground/40">
                {LANGUAGES.length.toString().padStart(2, "0")} / {LANGUAGES.length}
              </span>
            </div>

            <ol className="columns-1 gap-x-10 sm:columns-2 xl:columns-3">
              {LANGUAGES.map(([code, name], i) => (
                <li
                  key={code}
                  onMouseEnter={() => setHover(code)}
                  onMouseLeave={() => setHover(null)}
                  className={`flex break-inside-avoid items-baseline gap-3 border-b border-white/[0.07] py-2 transition-colors duration-300 ${
                    hover === code ? "text-accent" : "text-primary-foreground/75"
                  }`}
                >
                  <span className="w-6 shrink-0 font-mono text-[10px] text-primary-foreground/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-16 shrink-0 font-mono text-[11px] tracking-tight text-accent/80">{code}</span>
                  <span className="truncate text-[15px]">{name}</span>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-sm text-primary-foreground/50">
              Every locale ships with native formality rules, date and currency formatting, and RTL support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
