"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { setCourseBlockDone } from "@/app/actions";
import { DayTest } from "@/components/course/DayTest";
import { SentencePlayerSheet } from "@/components/course/SentencePlayerSheet";
import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { GRAMMAR_COURSE_ID, getStoryPicture, getWordPicture, type GrammarUnit } from "@/data/grammar";
import { shuffle, type TestQuestion } from "@/lib/day-test";
import type { GrammarExample } from "@/lib/grammar-examples";
import { speak } from "@/lib/speech";
import type { StudySentence } from "@/lib/video-study";

interface GrammarUnitViewProps {
  unit: GrammarUnit;
  examples: GrammarExample[];
  // The recorded voice for the story, the lines to shadow and the words' examples; null reads them in the
  // browser's voice.
  narration: { url: string; lineTimes: { start: number; end: number }[] } | null;
  isSignedIn: boolean;
  isPassed: boolean;
  nextHref: string | null;
}

const STORY_RATE = 0.85;

// Every place the pattern is used in a line, longest phrases first so "doesn't like" wins over "doesn't".
function highlight(text: string, pattern: string[]): ReactNode[] {
  const alternatives = [...pattern]
    .sort((a, b) => b.length - a.length)
    .map((p) => {
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return /^[A-Za-z]/.test(p) ? `(?<![A-Za-z])${escaped}(?![A-Za-z])` : `${escaped}(?![A-Za-z])`;
    });
  return text.split(new RegExp(`(${alternatives.join("|")})`, "i")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-md bg-highlight px-0.5 font-bold text-highlight-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function Step({ number, title, hint, children }: { number: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{number}</span>
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// A grammar unit, in the order comprehensible input asks for: meet the words through pictures, understand a picture
// story, notice the pattern, hear it in real videos, check it is understood, then say it.
export function GrammarUnitView({ unit, examples, narration, isSignedIn, isPassed, nextHref }: GrammarUnitViewProps) {
  const [isPatternShown, setIsPatternShown] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stopAtRef = useRef<number | null>(null);
  const [time, setTime] = useState(-1);
  const storyCount = unit.story.lines.length;
  const wordsStart = storyCount + unit.speak.shadow.length;

  // Stops exactly where a line (or the story) ends, more precisely than the timeupdate event can.
  useEffect(() => {
    if (!isReading || !narration) return;
    const id = setInterval(() => {
      const el = audioRef.current;
      if (!el) return;
      setTime(el.currentTime);
      if (stopAtRef.current !== null && el.currentTime >= stopAtRef.current) {
        el.pause();
        stopAtRef.current = null;
      }
    }, 50);
    return () => clearInterval(id);
  }, [isReading, narration]);

  const playLines = (first: number, last: number) => {
    const el = audioRef.current;
    if (!narration || !el) return false;
    el.currentTime = narration.lineTimes[first].start;
    stopAtRef.current = narration.lineTimes[last].end;
    void el.play();
    return true;
  };

  const playLine = (index: number, text: string) => {
    if (!playLines(index, index)) speak(text, "us", STORY_RATE);
  };
  const activeLine = narration && isReading ? narration.lineTimes.findIndex((t) => time >= t.start && time <= t.end + 0.3) : -1;
  const [heard, setHeard] = useState<{ videoId: string; sentence: StudySentence } | null>(null);
  const [hasPassed, setHasPassed] = useState(isPassed);

  const questions = useMemo<TestQuestion[]>(
    () =>
      unit.check.map((q, i) => ({
        kind: "meaning",
        prompt: q.question,
        answer: q.options[0],
        options: shuffle(q.options, unit.id * 31 + i),
        image: q.picture === undefined ? undefined : getStoryPicture(unit, q.picture),
      })),
    [unit],
  );

  const readStory = () => {
    if (isReading) {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setIsReading(false);
      return;
    }
    if (playLines(0, storyCount - 1)) return;
    setIsReading(true);
    speak(unit.story.lines.map((line) => line.text).join(" "), "us", STORY_RATE, () => setIsReading(false));
  };

  const handlePass = () => {
    setHasPassed(true);
    if (isSignedIn) void setCourseBlockDone({ courseId: GRAMMAR_COURSE_ID, day: unit.id, blockId: "check", isDone: true });
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {narration && (
        <audio
          ref={audioRef}
          src={narration.url}
          preload="metadata"
          onPlay={() => setIsReading(true)}
          onPause={() => setIsReading(false)}
          onEnded={() => setIsReading(false)}
        />
      )}
      <Step number={1} title="Words in pictures" hint="Look at each picture and tap it to hear the word in a sentence.">
        <ul lang="en" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {unit.words.map((word, i) => (
            <li key={word.word}>
              <button
                type="button"
                onClick={() => playLine(wordsStart + i, word.example)}
                aria-label={`Listen: ${word.example}`}
                className={`w-full overflow-hidden rounded-2xl border bg-cream text-left transition-colors hover:border-brand ${activeLine === wordsStart + i ? "border-brand" : "border-line"}`}
              >
                <Image src={getWordPicture(unit, word)} alt={word.word} width={320} height={320} sizes="(min-width: 640px) 220px, 45vw" className="aspect-square w-full" />
                <span className="block p-2.5">
                  <span className="block font-bold text-ink">{word.word}</span>
                  <span className="block text-sm leading-snug text-muted">{word.meaning}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Step>

      <Step number={2} title={unit.story.title} hint="Listen and look at the pictures. Just follow the story; don't think about grammar yet.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={readStory} className="btn-3d btn-brand px-4 py-2 text-sm">
            <Icon name={isReading ? "stop" : "volume"} className="size-4" />
            {isReading ? "Stop" : "Listen to the story"}
          </button>
          <button type="button" onClick={() => setIsPatternShown(!isPatternShown)} aria-pressed={isPatternShown} className="btn-3d px-4 py-2 text-sm">
            {isPatternShown ? "Hide the pattern" : "Show the pattern"}
          </button>
        </div>
        <ol lang="en" className="mt-4 space-y-3">
          {unit.story.lines.map((line, i) => (
            <li key={line.text} className={`flex items-center gap-3 rounded-2xl p-1.5 transition-colors ${activeLine === i ? "bg-brand-soft" : ""}`}>
              <Image
                src={getStoryPicture(unit, i)}
                alt=""
                width={320}
                height={320}
                sizes="(min-width: 640px) 144px, 96px"
                className="size-24 shrink-0 rounded-xl border border-line sm:size-36"
              />
              <p className="flex-1 text-lg leading-relaxed text-ink">{isPatternShown ? highlight(line.text, unit.pattern) : line.text}</p>
              <button
                type="button"
                onClick={() => playLine(i, line.text)}
                aria-label={`Listen: ${line.text}`}
                className="grid size-9 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
              >
                <Icon name="play" className="size-4" />
              </button>
            </li>
          ))}
        </ol>
      </Step>

      <Step number={3} title="Notice the pattern" hint="Now look at how the story says it. Turn on “Show the pattern” above to see every one.">
        <ul className="list-disc space-y-2 pl-5 leading-relaxed text-ink">
          {unit.explanation.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </Step>

      {examples.length > 0 && (
        <Step number={4} title="Hear it in real videos" hint="The same pattern, said by Bob the Canadian and English Sponge. Tap to hear each one.">
          <ul className="space-y-2">
            {examples.map((example) => (
              <li key={`${example.videoId}-${example.sentence.index}`} className="flex items-start gap-3 rounded-2xl border border-line bg-cream p-3">
                <button
                  type="button"
                  onClick={() => setHeard({ videoId: example.videoId, sentence: example.sentence })}
                  aria-label="Hear it in the video"
                  className="btn-3d shrink-0 px-3 py-1.5 text-sm"
                >
                  <Icon name="play" className="size-4" />
                </button>
                <div className="min-w-0">
                  <p lang="en" className="leading-relaxed text-ink">
                    {example.parts.map((part, i) =>
                      part.isMatch ? (
                        <mark key={i} className="rounded-md bg-highlight px-0.5 font-bold text-highlight-ink">
                          {part.text}
                        </mark>
                      ) : (
                        part.text
                      ),
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">{example.title}</p>
                </div>
              </li>
            ))}
          </ul>
        </Step>
      )}

      <Step number={examples.length > 0 ? 5 : 4} title="Check" hint="Questions about the story and what the pattern means. Get 80% right to finish the unit.">
        <DayTest questions={questions} videoId={null} onPass={handlePass} passMessage="Passed! This unit is done." meaningLabel="The story and the pattern" />
        {hasPassed && <p className="mt-2 text-sm font-semibold text-brand">Unit done.</p>}
      </Step>

      <Step number={examples.length > 0 ? 6 : 5} title="Say it" hint="Shadow the lines, then answer about yourself. Recordings stay on your device.">
        <ul lang="en" className="space-y-3">
          {unit.speak.shadow.map((line, i) => (
            <li key={line} className="rounded-2xl border border-line bg-cream p-3">
              <div className="flex items-start gap-2">
                <p className="flex-1 font-semibold leading-snug text-ink">{line}</p>
                <button
                  type="button"
                  onClick={() => playLine(storyCount + i, line)}
                  aria-label={`Listen: ${line}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
                >
                  <Icon name="volume" className="size-5" />
                </button>
              </div>
              <div className="mt-2">
                <VoiceRecorder target={line} recordLabel="Say it" />
              </div>
            </li>
          ))}
          {unit.speak.prompts.map((prompt) => (
            <li key={prompt} className="rounded-2xl border border-brand/30 bg-brand-soft/50 p-3">
              <p className="font-semibold leading-snug text-ink">{prompt}</p>
              <div className="mt-2">
                <VoiceRecorder recordLabel="Record your answer" />
              </div>
            </li>
          ))}
        </ul>
      </Step>

      {nextHref && (
        <div className="flex justify-end">
          <Link href={nextHref} className="btn-3d btn-brand px-5 py-2.5">
            Next unit
            <Icon name="chevronRight" className="size-4" />
          </Link>
        </div>
      )}

      {heard && (
        <SentencePlayerSheet
          key={`${heard.videoId}-${heard.sentence.index}`}
          videoId={heard.videoId}
          sentence={heard.sentence}
          lessonHref={`/watch/${heard.videoId}?mode=shadow&s=${heard.sentence.index}`}
          onClose={() => setHeard(null)}
        />
      )}
    </div>
  );
}
