"use client";

import { useMemo } from "react";
import { Icon } from "@/components/Icon";
import type { Lesson } from "@/lib/lesson";
import { speak } from "@/lib/speech";

interface SummaryPanelProps {
  lesson: Lesson;
  onPlaySentence: (index: number) => void;
}

const STOP_WORDS = new Set(
  (
    "about above after again against also because been before being below between both could does doing down during each " +
    "from further have having here into just like more most much once only other over really same should some still such " +
    "than that their them then there these they thing things this those through very want were what when where which while " +
    "will with would your yours going know think yeah okay right well gonna wanna said says something someone everyone " +
    "today make made good great little people time actually maybe pretty kind sort quite lots always never every another"
  ).split(" "),
);
const KEY_WORD_COUNT = 12;

// Without a stored summary: the most repeated content words, each linked to the first sentence that uses it.
function getFrequentWords(lesson: Lesson): { word: string; count: number; firstIndex: number }[] {
  const stats = new Map<string, { count: number; firstIndex: number }>();
  lesson.sentences.forEach((sentence, index) => {
    for (const raw of sentence.text.toLowerCase().match(/[a-z']+/g) ?? []) {
      const word = raw.replace(/'s$/, "");
      if (word.length < 4 || STOP_WORDS.has(word) || word.includes("'")) continue;
      const entry = stats.get(word);
      if (entry) entry.count++;
      else stats.set(word, { count: 1, firstIndex: index });
    }
  });
  return [...stats.entries()]
    .filter(([, s]) => s.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, KEY_WORD_COUNT)
    .map(([word, s]) => ({ word, ...s }));
}

function findFirstSentence(lesson: Lesson, word: string): number {
  const needle = word.toLowerCase();
  return lesson.sentences.findIndex((s) => s.text.toLowerCase().includes(needle));
}

export function SummaryPanel({ lesson, onPlaySentence }: SummaryPanelProps) {
  const { summary } = lesson;
  const frequentWords = useMemo(() => (summary ? [] : getFrequentWords(lesson)), [lesson, summary]);
  const minutes = Math.max(1, Math.round(lesson.durationSec / 60));

  if (summary) {
    return (
      <div lang="en" className="space-y-5 px-2 pb-6">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-accent">What it&apos;s about</h3>
          <p className="mt-1.5 leading-relaxed text-ink">{summary.overview}</p>
        </section>
        {summary.keyPoints.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-accent">Main points</h3>
            <ul className="mt-1.5 space-y-1.5">
              {summary.keyPoints.map((point) => (
                <li key={point} className="flex gap-2 leading-snug text-ink">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}
        {summary.keyWords.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-accent">Useful words</h3>
            <ul className="mt-2 space-y-2">
              {summary.keyWords.map((k) => {
                const index = findFirstSentence(lesson, k.word);
                return (
                  <li key={k.word} className="rounded-2xl border border-line bg-surface p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-ink">{k.word}</p>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => speak(k.word, "uk")}
                          aria-label={`Hear "${k.word}"`}
                          className="grid size-9 place-items-center rounded-full text-brand hover:bg-brand-soft"
                        >
                          <Icon name="volume" className="size-4" />
                        </button>
                        {index >= 0 && (
                          <button
                            type="button"
                            onClick={() => onPlaySentence(index)}
                            className="min-h-9 rounded-lg bg-brand-soft px-2.5 text-xs font-bold text-brand"
                          >
                            In the video
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{k.meaning}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <div lang="en" className="space-y-5 px-2 pb-6">
      <p className="rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-muted">
        A full summary isn&apos;t ready for this video yet. Here is a quick overview from the transcript.
      </p>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-accent">At a glance</h3>
        <p className="mt-1.5 text-ink">
          About {minutes} min · {lesson.sentences.length} sentences
        </p>
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wide text-accent">How it starts</h3>
        <p className="mt-1.5 leading-relaxed text-ink">
          {lesson.sentences
            .slice(0, 3)
            .map((s) => s.text)
            .join(" ")}
        </p>
      </section>
      {frequentWords.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-accent">Words you&apos;ll hear a lot</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {frequentWords.map((w) => (
              <li key={w.word}>
                <button
                  type="button"
                  onClick={() => onPlaySentence(w.firstIndex)}
                  className="min-h-9 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-brand"
                  aria-label={`${w.word}, said ${w.count} times. Play the first sentence with it`}
                >
                  {w.word} <span className="text-muted">×{w.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
