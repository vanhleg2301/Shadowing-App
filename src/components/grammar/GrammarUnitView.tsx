"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { setCourseBlockDone } from "@/app/actions";
import { DayTest } from "@/components/course/DayTest";
import { SentencePlayerSheet } from "@/components/course/SentencePlayerSheet";
import { Icon } from "@/components/Icon";
import { CardDeck } from "@/components/lesson/CardDeck";
import { FocusScreen } from "@/components/lesson/FocusScreen";
import { LessonPath, type LessonStage } from "@/components/lesson/LessonPath";
import { LessonNotes } from "@/components/LessonNotes";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { GRAMMAR_COURSE_ID, getStoryPicture, type GrammarUnit } from "@/data/grammar";
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
  // Parts already finished: story, pattern, videos, check, speak. Passing the check finishes the unit.
  passed: string[];
  nextHref: string | null;
}

type StageId = "story" | "pattern" | "videos" | "check" | "speak";

const CHECK_COVERS: StageId[] = ["story", "pattern", "videos"];
const STORY_RATE = 0.85;
const PICTURE_QUESTIONS = 3;

function playFrom(audio: HTMLAudioElement, seconds: number) {
  audio.currentTime = seconds;
  void audio.play();
}

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

// A grammar unit as a path of parts, each on its own focus screen, in the order comprehensible input asks for:
// understand a picture story, notice the pattern, hear it in real videos, check it is understood, then say it.
// The unit's words are taught in Vocabulary.
export function GrammarUnitView({ unit, examples, narration, isSignedIn, passed, nextHref }: GrammarUnitViewProps) {
  const [finished, setDone] = useState(passed);
  // Passing the check shows the unit was understood, so the parts before it count as done too (units passed
  // before the path existed stored only "check").
  const done = finished.includes("check") ? [...new Set([...finished, ...CHECK_COVERS])] : finished;
  const [open, setOpen] = useState<StageId | null>(null);
  const [isReading, setIsReading] = useState(false);
  // State rather than refs: the story's play buttons are built during render, and the React Compiler can't tell
  // they only read the player when tapped.
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [stopAt, setStopAt] = useState<number | null>(null);
  const [time, setTime] = useState(-1);
  const storyCount = unit.story.lines.length;

  // Stops exactly where a line (or the story) ends, more precisely than the timeupdate event can.
  useEffect(() => {
    if (!isReading || !narration || !audio) return;
    const id = setInterval(() => {
      setTime(audio.currentTime);
      if (stopAt !== null && audio.currentTime >= stopAt) {
        audio.pause();
        setStopAt(null);
      }
    }, 50);
    return () => clearInterval(id);
  }, [isReading, narration, audio, stopAt]);

  const playLines = (first: number, last: number) => {
    if (!narration || !audio) return false;
    setStopAt(narration.lineTimes[last].end);
    playFrom(audio, narration.lineTimes[first].start);
    return true;
  };

  const playLine = (index: number, text: string) => {
    if (!playLines(index, index)) speak(text, "us", STORY_RATE);
  };
  const activeLine = narration && isReading ? narration.lineTimes.findIndex((t) => time >= t.start && time <= t.end + 0.3) : -1;
  const [heard, setHeard] = useState<{ videoId: string; sentence: StudySentence } | null>(null);

  const questions = useMemo<TestQuestion[]>(() => {
    const pictures = unit.story.lines.map((_, i) => getStoryPicture(unit, i));
    const pictureQuestions = shuffle(
      unit.story.lines.map((line, i) => ({ line, i })),
      unit.id * 17,
    )
      .slice(0, PICTURE_QUESTIONS)
      .map(({ line, i }, n): TestQuestion => {
        const others = shuffle(
          pictures.filter((_, j) => j !== i),
          unit.id * 13 + n,
        ).slice(0, 3);
        return { kind: "picture", text: line.text, answer: pictures[i], options: shuffle([pictures[i], ...others], unit.id * 7 + n) };
      });
    const meaningQuestions = unit.check.map(
      (q, i): TestQuestion => ({
        kind: "meaning",
        prompt: q.question,
        answer: q.options[0],
        options: shuffle(q.options, unit.id * 31 + i),
        image: q.picture === undefined ? undefined : getStoryPicture(unit, q.picture),
      }),
    );
    return [...pictureQuestions, ...meaningQuestions];
  }, [unit]);

  const listenToStoryLine = (text: string) => {
    playLine(
      unit.story.lines.findIndex((line) => line.text === text),
      text,
    );
  };

  const stopReading = () => {
    audio?.pause();
    window.speechSynthesis?.cancel();
    setIsReading(false);
  };

  const readStory = () => {
    if (isReading) {
      stopReading();
      return;
    }
    if (playLines(0, storyCount - 1)) return;
    setIsReading(true);
    speak(unit.story.lines.map((line) => line.text).join(" "), "us", STORY_RATE, () => setIsReading(false));
  };

  const finishStage = (id: StageId) => {
    if (done.includes(id)) return;
    setDone((list) => [...list, id]);
    if (isSignedIn) void setCourseBlockDone({ courseId: GRAMMAR_COURSE_ID, day: unit.id, blockId: id, isDone: true });
  };

  const close = () => {
    stopReading();
    setOpen(null);
  };

  const stages: LessonStage[] = [
    { id: "story", title: unit.story.title, detail: `A picture story · ${storyCount} pictures`, icon: "book", isDone: done.includes("story") },
    { id: "pattern", title: "Notice the pattern", detail: "How the story says it", icon: "search", isDone: done.includes("pattern") },
  ];
  if (examples.length > 0) {
    stages.push({ id: "videos", title: "Hear it in real videos", detail: `${examples.length} lines from videos`, icon: "play", isDone: done.includes("videos") });
  }
  stages.push(
    { id: "check", title: "Check", detail: "Get 80% right to finish the unit", icon: "chart", isDone: done.includes("check") },
    { id: "speak", title: "Say it", detail: "Shadow the lines, then talk about you", icon: "mic", isDone: done.includes("speak"), isOptional: true },
  );

  const sentenceSheet = heard && (
    <SentencePlayerSheet
      key={`${heard.videoId}-${heard.sentence.index}`}
      videoId={heard.videoId}
      sentence={heard.sentence}
      lessonHref={`/watch/${heard.videoId}?mode=shadow&s=${heard.sentence.index}`}
      onClose={() => setHeard(null)}
    />
  );

  const renderScreen = (id: StageId) => {
    if (id === "story") {
      return (
        <CardDeck
          title="The story"
          cards={unit.story.lines.map((line, i) => (
            <StoryCard key={line.text} picture={getStoryPicture(unit, i)} text={line.text} isActive={activeLine === i} onListen={() => playLine(i, line.text)} />
          ))}
          onClose={close}
          onDone={() => finishStage("story")}
          summaryTitle="You followed the story!"
          summaryDetail="Now hear it all the way through."
          finish={
            <button type="button" onClick={readStory} className="btn-3d btn-brand py-3">
              <Icon name={isReading ? "stop" : "volume"} className="size-4" />
              {isReading ? "Stop" : "Listen to the whole story"}
            </button>
          }
        />
      );
    }
    if (id === "pattern") {
      return (
        <FocusScreen
          title="Notice the pattern"
          progress={done.includes("pattern") ? 1 : 0}
          onClose={close}
          footer={
            <button
              type="button"
              onClick={() => {
                finishStage("pattern");
                close();
              }}
              className="btn-3d btn-brand w-full py-3"
            >
              Got it
            </button>
          }
        >
          <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-ink">
            {unit.explanation.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-accent">In the story</p>
          <ol lang="en" className="mt-2 space-y-2">
            {unit.story.lines.map((line, i) => (
              <li key={line.text} className={`flex items-center gap-3 rounded-2xl p-1.5 transition-colors ${activeLine === i ? "bg-brand-soft" : ""}`}>
                <Image src={getStoryPicture(unit, i)} alt="" width={320} height={320} sizes="64px" className="size-16 shrink-0 rounded-xl border border-line" />
                <p className="flex-1 leading-relaxed text-ink">{highlight(line.text, unit.pattern)}</p>
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
        </FocusScreen>
      );
    }
    if (id === "videos") {
      return (
        <CardDeck
          title="In real videos"
          cards={examples.map((example) => (
            <div key={`${example.videoId}-${example.sentence.index}`}>
              <p lang="en" className="text-2xl font-semibold leading-snug text-ink">
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
              <p className="mt-2 text-sm text-muted">{example.title}</p>
              <button type="button" onClick={() => setHeard({ videoId: example.videoId, sentence: example.sentence })} className="btn-3d mt-4 px-4 py-2.5 text-sm">
                <Icon name="play" className="size-4" />
                Hear it in the video
              </button>
            </div>
          ))}
          onClose={close}
          onDone={() => finishStage("videos")}
          summaryTitle="Heard it for real!"
          summaryDetail="Real people say it just like the story does. Now check you've got it."
        >
          {sentenceSheet}
        </CardDeck>
      );
    }
    if (id === "check") {
      return (
        <FocusScreen title="Check" progress={done.includes("check") ? 1 : 0} onClose={close}>
          <p className="mb-4 text-sm text-muted">Match what you hear to the pictures, then answer about the story and the pattern. Get 80% right to finish the unit.</p>
          <DayTest
            questions={questions}
            videoId={null}
            onPass={() => finishStage("check")}
            onListen={listenToStoryLine}
            passMessage="Passed! This unit is done."
            meaningLabel="The story and the pattern"
          />
        </FocusScreen>
      );
    }
    return (
      <CardDeck
        title="Say it"
        cards={[
          ...unit.speak.shadow.map((line, i) => (
            <div key={line}>
              <p className="text-sm text-muted">Listen, then say it the same way.</p>
              <div className="mt-2 flex items-start gap-2">
                <p lang="en" className="flex-1 text-2xl font-semibold leading-snug text-ink">
                  {line}
                </p>
                <button
                  type="button"
                  onClick={() => playLine(storyCount + i, line)}
                  aria-label={`Listen: ${line}`}
                  className="grid size-10 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
                >
                  <Icon name="volume" className="size-5" />
                </button>
              </div>
              <div className="mt-4">
                <VoiceRecorder target={line} recordLabel="Say it" />
              </div>
            </div>
          )),
          ...unit.speak.prompts.map((prompt) => (
            <div key={prompt}>
              <p className="text-sm text-muted">Now about you. Recordings stay on your device.</p>
              <p className="mt-2 text-2xl font-semibold leading-snug text-ink">{prompt}</p>
              <div className="mt-4">
                <VoiceRecorder recordLabel="Record your answer" />
              </div>
            </div>
          )),
        ]}
        onClose={close}
        onDone={() => finishStage("speak")}
        summaryTitle="Well said!"
        summaryDetail="Saying it about your own life is what makes the pattern yours."
      />
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {narration && (
        <audio
          ref={setAudio}
          src={narration.url}
          preload="metadata"
          onPlay={() => setIsReading(true)}
          onPause={() => setIsReading(false)}
          onEnded={() => setIsReading(false)}
        />
      )}
      <LessonPath stages={stages} onOpen={(id) => setOpen(id as StageId)} />

      {done.includes("check") && <p className="rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3 font-semibold text-brand">Unit done. Well done!</p>}

      <LessonNotes lessonKey={`grammar:${unit.slug}`} title={`Grammar: ${unit.title}`} href={`/grammar/${unit.slug}`} />

      {nextHref && (
        <div className="flex justify-end">
          <Link href={nextHref} className="btn-3d btn-brand px-5 py-2.5">
            Next unit
            <Icon name="chevronRight" className="size-4" />
          </Link>
        </div>
      )}

      {open && renderScreen(open)}
    </div>
  );
}

interface StoryCardProps {
  picture: string;
  text: string;
  isActive: boolean;
  onListen: () => void;
}

// One picture of the story: listen first, then show the words if you need them.
function StoryCard({ picture, text, isActive, onListen }: StoryCardProps) {
  const [isShown, setIsShown] = useState(false);
  return (
    <div>
      <Image
        src={picture}
        alt=""
        width={640}
        height={640}
        sizes="(min-width: 640px) 24rem, 80vw"
        className="mx-auto aspect-square w-full max-w-sm rounded-3xl border border-line"
      />
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={onListen} aria-label="Listen to this picture" className="btn-3d btn-brand grid size-12 shrink-0 place-items-center p-0">
          <Icon name="volume" className="size-5" />
        </button>
        {isShown ? (
          <p lang="en" className={`flex-1 rounded-xl px-1 text-lg leading-relaxed text-ink ${isActive ? "bg-brand-soft" : ""}`}>
            {text}
          </p>
        ) : (
          <button type="button" onClick={() => setIsShown(true)} className="flex-1 text-left">
            <span aria-hidden className="block select-none text-lg leading-relaxed text-ink blur-sm">
              {text}
            </span>
            <span className="text-sm font-semibold text-brand">Show the words</span>
          </button>
        )}
      </div>
    </div>
  );
}
