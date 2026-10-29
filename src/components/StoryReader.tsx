"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Words } from "@/components/TranscriptRow";
import { WordLookupSheet } from "@/components/WordLookupSheet";
import { READER_SIZES, READER_SPACINGS, useReaderPrefs } from "@/hooks/useReaderPrefs";
import { useWordLookup } from "@/hooks/useWordLookup";
import { getStoryLabel, splitSentences, type Story } from "@/data/stories";
import { speak, type Accent } from "@/lib/speech";

interface StoryReaderProps {
  story: Story;
  initialSavedWords: string[];
}

interface StorySentence {
  text: string;
  line: number;
  accent: Accent;
}

const RATES = [0.9, 0.75, 1];

// Read a story or dialogue, or listen to it like a podcast in the browser's own voice (free, works offline
// once loaded). In dialogues each speaker gets a different accent.
export function StoryReader({ story, initialSavedWords }: StoryReaderProps) {
  const { lookup, openWord, sheetProps } = useWordLookup(story.id, initialSavedWords);
  const { prefs } = useReaderPrefs();
  const [active, setActive] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rateIndex, setRateIndex] = useState(0);
  const playingRef = useRef(false);

  const speakers = [...new Set(story.lines.map((l) => l.speaker).filter(Boolean))];
  const sentences: StorySentence[] = story.lines.flatMap((line, i) =>
    splitSentences(line.text).map((text) => ({ text, line: i, accent: speakers.indexOf(line.speaker) === 1 ? "uk" : "us" })),
  );

  useEffect(() => () => speechSynthesis.cancel(), []);

  const stop = () => {
    playingRef.current = false;
    setIsPlaying(false);
    speechSynthesis.cancel();
  };

  const playFrom = (index: number, rate = RATES[rateIndex]) => {
    if (index >= sentences.length) {
      stop();
      setActive(-1);
      return;
    }
    playingRef.current = true;
    setIsPlaying(true);
    setActive(index);
    speak(sentences[index].text, sentences[index].accent, rate, () => {
      if (playingRef.current) playFrom(index + 1, rate);
    });
  };

  const handleRate = () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    if (playingRef.current) playFrom(Math.max(active, 0), RATES[next]);
  };

  const handleWordClick = (token: string, sentence: string) => {
    if (openWord(token, sentence)) stop();
  };

  const isDialogue = story.kind === "small-talk";

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-44 pt-[calc(env(safe-area-inset-top)+1rem)] md:px-8 md:pb-32">
      <Link href="/stories" className="text-sm font-semibold text-brand">
        ← All stories
      </Link>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent">
        {getStoryLabel(story)}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-ink md:text-3xl">{story.title}</h1>
      <p className="mt-2 text-muted">{story.summary}</p>
      <p className="mt-1 text-sm text-muted">Tap a word for its meaning. Tap a sentence to hear it.</p>

      <div
        lang="en"
        className={`mt-5 text-ink ${isDialogue ? "space-y-3" : "space-y-[0.9em]"}`}
        style={{ fontSize: READER_SIZES[prefs.sizeIndex], lineHeight: READER_SPACINGS[prefs.spacing] }}
      >
        {story.lines.map((line, lineIndex) => {
          const content = sentences.map((sentence, i) =>
            sentence.line === lineIndex ? (
              <span key={i}>
                <span
                  onClick={() => playFrom(i)}
                  className={`cursor-pointer rounded-md transition-colors ${i === active ? "bg-brand-soft" : ""}`}
                >
                  <Words text={sentence.text} activeWord={-1} onWordClick={handleWordClick} />
                </span>{" "}
              </span>
            ) : null,
          );
          if (!line.speaker) return <p key={lineIndex}>{content}</p>;
          const isSecond = speakers.indexOf(line.speaker) === 1;
          return (
            <div key={lineIndex} className={`flex ${isSecond ? "justify-end" : ""}`}>
              <div className={`max-w-[85%] rounded-2xl border px-3 py-2 ${isSecond ? "border-brand/25 bg-brand-soft/50" : "border-line bg-surface"}`}>
                <p className="text-xs font-bold text-muted">{line.speaker}</p>
                <p>{content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">Words to notice</h2>
        <ul className="mt-3 space-y-2">
          {story.words.map((w) => (
            <li key={w.word} className="rounded-2xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <p className="flex-1 font-bold text-ink">{w.word}</p>
                <button
                  type="button"
                  onClick={() => speak(w.example, "us", 0.85)}
                  aria-label={`Hear "${w.example}"`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
                >
                  <Icon name="volume" className="size-5" />
                </button>
              </div>
              <p className="text-sm text-muted">{w.meaning}</p>
              <p className="mt-1.5 rounded-xl bg-cream px-3 py-1.5 text-sm italic text-ink/90">“{w.example}”</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold text-ink">Grammar in this {isDialogue ? "conversation" : "story"}</h2>
        <ul className="mt-3 space-y-3">
          {story.grammar.map((g) => (
            <li key={g.point} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-bold text-ink">{g.point}</p>
              <p className="mt-1 text-sm text-muted">{g.explanation}</p>
              <ul className="mt-2 space-y-1">
                {g.examples.map((example) => (
                  <li key={example} className="border-l-2 border-accent pl-3 text-sm italic text-ink/90">
                    {example}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 px-4 md:bottom-6">
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-3xl border border-line bg-surface p-2 shadow-lg">
          <button
            type="button"
            onClick={() => playFrom(Math.max(active - 1, 0))}
            className="btn-3d size-11 rounded-full"
            aria-label="Previous sentence"
          >
            <Icon name="prev" className="size-5" />
          </button>
          <button
            type="button"
            onClick={isPlaying ? stop : () => playFrom(Math.max(active, 0))}
            className="btn-3d btn-brand size-12 rounded-full"
            aria-label={isPlaying ? "Pause" : "Listen"}
          >
            <Icon name={isPlaying ? "pause" : "play"} className="size-6" />
          </button>
          <button type="button" onClick={() => playFrom(active + 1)} className="btn-3d size-11 rounded-full" aria-label="Next sentence">
            <Icon name="next" className="size-5" />
          </button>
          <p className="min-w-0 flex-1 truncate px-1 text-sm text-muted">
            {active >= 0 ? `${active + 1} / ${sentences.length}` : `${sentences.length} sentences`}
          </p>
          <button type="button" onClick={handleRate} className="btn-3d px-3 py-2 text-sm font-bold" aria-label="Reading speed">
            {RATES[rateIndex]}×
          </button>
        </div>
      </div>

      {lookup && sheetProps && <WordLookupSheet {...sheetProps} />}
    </article>
  );
}
