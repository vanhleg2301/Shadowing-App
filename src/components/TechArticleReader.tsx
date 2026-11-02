"use client";

import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { Words } from "@/components/TranscriptRow";
import { WordLookupSheet } from "@/components/WordLookupSheet";
import { splitSentences } from "@/data/stories";
import { READER_SIZES, READER_SPACINGS, useReaderPrefs } from "@/hooks/useReaderPrefs";
import { useWordLookup } from "@/hooks/useWordLookup";
import { speak } from "@/lib/speech";
import type { TechArticle } from "@/lib/tech-news";

interface TechArticleReaderProps {
  article: TechArticle;
  dateLabel: string | null;
  initialSavedWords: string[];
}

const RATES = [1, 0.9, 0.75];

// An article republished from The Conversation under CC BY-ND: its words stay as written, it credits the authors
// and the source at the top, and it shows their page counter. Listening uses the voice on the learner's device.
export function TechArticleReader({ article, dateLabel, initialSavedWords }: TechArticleReaderProps) {
  const { lookup, openWord, sheetProps } = useWordLookup(article.id, initialSavedWords);
  const { prefs } = useReaderPrefs();
  const [active, setActive] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rateIndex, setRateIndex] = useState(0);
  const playingRef = useRef(false);

  const blocks = article.blocks.map((block) => ({ ...block, sentences: splitSentences(block.text) }));
  const sentences = blocks.flatMap((block) => block.sentences);

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
    speak(sentences[index], "us", rate, () => {
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

  let sentenceIndex = -1;
  const renderSentences = (block: (typeof blocks)[number]) =>
    block.sentences.map((sentence) => {
      const index = ++sentenceIndex;
      return (
        <span key={index}>
          <span onClick={() => playFrom(index)} className={`cursor-pointer rounded-md transition-colors ${index === active ? "bg-brand-soft" : ""}`}>
            <Words text={sentence} activeWord={-1} onWordClick={handleWordClick} />
          </span>{" "}
        </span>
      );
    });

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-44 pt-[calc(env(safe-area-inset-top)+1rem)] md:px-8 md:pb-32">
      <Breadcrumbs items={[{ label: "News", href: "/news" }, { label: "AI & Tech", href: "/news/ai-tech" }, { label: article.title }]} className="" />
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent">
        Estimated level ≈{article.level}
        {dateLabel && <span className="text-muted"> · {dateLabel}</span>}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-ink md:text-3xl">{article.title}</h1>
      <p className="mt-2 text-sm text-ink">{article.authors.join("; ")}</p>
      <p className="mt-1 text-sm text-muted">
        Republished from{" "}
        <a href={article.source_url} target="_blank" rel="noopener" className="font-semibold text-brand">
          The Conversation
        </a>{" "}
        under{" "}
        <a href="https://creativecommons.org/licenses/by-nd/4.0/" target="_blank" rel="noopener license" className="font-semibold text-brand">
          CC BY-ND 4.0
        </a>
        . Read the original for its images and links.
      </p>
      <p className="mt-1 text-sm text-muted">Tap a word for its meaning. Tap a sentence to hear it.</p>

      <div
        lang="en"
        className="mt-5 space-y-[0.9em] text-ink"
        style={{ fontSize: READER_SIZES[prefs.sizeIndex], lineHeight: READER_SPACINGS[prefs.spacing] }}
      >
        {blocks.map((block, i) => {
          if (block.type === "h") {
            return (
              <h2 key={i} className="pt-2 font-extrabold">
                {renderSentences(block)}
              </h2>
            );
          }
          if (block.type === "li") {
            return (
              <p key={i} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span className="min-w-0">{renderSentences(block)}</span>
              </p>
            );
          }
          return <p key={i}>{renderSentences(block)}</p>;
        })}
      </div>

      {article.disclosure && <p className="mt-8 text-xs italic text-muted">{article.disclosure}</p>}
      {/* The page counter The Conversation requires for republished articles. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a 1x1 counter must load as they serve it */}
      <img src={article.counter_url} alt="" width={1} height={1} className="absolute size-px" />

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 px-4 md:bottom-6">
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-3xl border border-line bg-surface p-2 shadow-lg">
          <button type="button" onClick={() => playFrom(Math.max(active - 1, 0))} className="btn-3d size-11 rounded-full" aria-label="Previous sentence">
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
