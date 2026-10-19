"use client";

import { Icon } from "@/components/Icon";
import type { WordInfo } from "@/lib/dictionary";
import { speak, type Accent } from "@/lib/speech";

export interface WordLookupState {
  word: string;
  sentence: string;
  status: "loading" | "found" | "error";
  info: WordInfo | null;
}

interface WordLookupSheetProps {
  lookup: WordLookupState;
  onClose: () => void;
  onRetry: () => void;
  // Omitted when sign-in isn't configured, which hides the save button.
  saved?: { isSaved: boolean; onToggle: () => void };
}

const ACCENTS: { accent: Accent; label: string }[] = [
  { accent: "uk", label: "UK" },
  { accent: "us", label: "US" },
];

export function WordLookupSheet({ lookup, onClose, onRetry, saved }: WordLookupSheetProps) {
  const { info } = lookup;
  const ipa = (accent: Accent) => (accent === "uk" ? info?.ipaUk : info?.ipaUs);

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        lang="en"
        className="max-h-[85dvh] w-full max-w-lg animate-sheet-up overflow-y-auto rounded-t-3xl border border-line bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-3xl font-extrabold text-ink">{lookup.word}</h2>
            {info && info.word !== lookup.word && (
              <p className="mt-0.5 text-sm text-muted">
                Base form: <b className="text-ink">{info.word}</b>
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {saved && lookup.status === "found" && (
              <button
                type="button"
                onClick={saved.onToggle}
                aria-pressed={saved.isSaved}
                className={`btn-3d px-3 py-2 text-sm ${saved.isSaved ? "btn-brand" : ""}`}
              >
                {saved.isSaved ? "Saved" : "Save word"}
              </button>
            )}
            <button type="button" aria-label="Close" className="rounded-full p-2 text-muted hover:bg-cream" onClick={onClose}>
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENTS.map(({ accent, label }) => (
            <button
              key={accent}
              type="button"
              onClick={() => speak(lookup.word, accent)}
              aria-label={`Listen in ${label} English`}
              className="btn-3d btn-soft gap-2 px-3 py-2 text-sm"
            >
              <Icon name="volume" className="size-4" />
              <span className="font-bold">{label}</span>
              {ipa(accent) && <span className="font-normal">/{ipa(accent)}/</span>}
            </button>
          ))}
        </div>

        <p className="mt-4 rounded-2xl bg-cream p-3 text-sm italic text-muted">“{lookup.sentence}”</p>

        {lookup.status === "loading" && <p className="mt-4 text-muted">Looking up...</p>}
        {lookup.status === "error" && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-red-600">Sorry, we couldn&apos;t find this word.</p>
            <button type="button" className="btn-3d px-4 py-2 text-sm" onClick={onRetry}>
              Try again
            </button>
          </div>
        )}

        {info?.contextMeaning && (
          <section className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">In this sentence</h3>
            <p className="mt-1 text-lg font-semibold text-brand">{info.contextMeaning}</p>
          </section>
        )}

        {info && info.meanings.length > 0 && (
          <section className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Meanings</h3>
            <ul className="mt-2 space-y-3">
              {info.meanings.map((m, i) => (
                <li key={i}>
                  {m.partOfSpeech && (
                    <span className="mr-2 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-dark">
                      {m.partOfSpeech}
                    </span>
                  )}
                  <span className="text-ink">{m.definition}</span>
                  {m.example && <p className="mt-0.5 text-sm italic text-muted">“{m.example}”</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {info && info.phrases.length > 0 && (
          <section className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Common phrases</h3>
            <ul className="mt-2 divide-y divide-line rounded-2xl border border-line">
              {info.phrases.map((p) => (
                <li key={p.text} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{p.text}</p>
                    {p.meaning && <p className="text-sm text-ink/80">{p.meaning}</p>}
                    {p.example && <p className="text-sm italic text-muted">“{p.example}”</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {ACCENTS.map(({ accent, label }) => (
                      <button
                        key={accent}
                        type="button"
                        aria-label={`Listen to "${p.text}" in ${label} English`}
                        className="rounded-lg px-2 py-1 text-xs font-bold text-brand hover:bg-brand-soft"
                        onClick={() => speak(p.text, accent)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {info?.source === "free" && (
          <p className="mt-5 text-xs text-muted">Basic dictionary mode. AI explanations will appear when the API key is active.</p>
        )}
      </div>
    </div>
  );
}
