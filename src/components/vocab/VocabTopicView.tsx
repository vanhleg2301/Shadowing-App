"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { savePhrasesToReview, setCourseBlockDone } from "@/app/actions";
import { DayTest } from "@/components/course/DayTest";
import { Icon } from "@/components/Icon";
import { LessonNotes } from "@/components/LessonNotes";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useAuth } from "@/hooks/useAuth";
import { VOCAB_COURSE_ID, getPhraseCore, getPhrasePicture, getTopicChecks, type VocabTopic } from "@/data/vocabulary";
import { BLANK, shuffle, type TestQuestion } from "@/lib/day-test";
import { speak } from "@/lib/speech";

interface VocabTopicViewProps {
  topic: VocabTopic;
  isSignedIn: boolean;
  passed: string[];
  nextHref: string | null;
}

const QUIZ_LENGTH = 6;
const RATE = 0.85;

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

// Three other phrases of the topic, and the answer, in a stable order.
function getOptions(answer: string, all: string[], seed: number): string[] {
  const others = shuffle(
    all.filter((text) => text !== answer),
    seed,
  ).slice(0, 3);
  return shuffle([answer, ...others], seed + 50);
}

// A vocabulary topic: learn the phrases with pictures, say what a picture shows, choose what to say in a
// situation, fill them into a conversation, then say them yourself.
export function VocabTopicView({ topic, isSignedIn, passed, nextHref }: VocabTopicViewProps) {
  const { signInWithGoogle } = useAuth();
  const [passedChecks, setPassedChecks] = useState(passed);
  const [isSaving, startSaving] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [playingLine, setPlayingLine] = useState(-1);
  const dialogueRunRef = useRef(0);
  const checks = getTopicChecks(topic);
  const isDone = checks.every((check) => passedChecks.includes(check));

  useEffect(
    () => () => {
      dialogueRunRef.current++;
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const pictureQuestions = useMemo<TestQuestion[]>(
    () =>
      shuffle(topic.phrases, topic.id * 11)
        .slice(0, QUIZ_LENGTH)
        .map((p, i) => ({
          kind: "meaning",
          prompt: "Which phrase goes with this picture?",
          image: getPhrasePicture(topic, p),
          answer: p.phrase,
          options: getOptions(
            p.phrase,
            topic.phrases.map((o) => o.phrase),
            topic.id * 13 + i,
          ),
        })),
    [topic],
  );
  const situationQuestions = useMemo<TestQuestion[]>(
    () =>
      shuffle(
        topic.phrases.filter((p) => p.situation),
        topic.id * 17,
      )
        .slice(0, QUIZ_LENGTH)
        .map((p, i) => ({
          kind: "meaning",
          prompt: p.situation ?? "",
          answer: p.phrase,
          options: getOptions(
            p.phrase,
            topic.phrases.map((o) => o.phrase),
            topic.id * 19 + i,
          ),
        })),
    [topic],
  );
  const dialogueQuestions = useMemo<TestQuestion[]>(() => {
    const cores = topic.phrases.map((p) => getPhraseCore(p.phrase));
    return (topic.dialogue?.lines ?? []).flatMap((line, i): TestQuestion[] => {
      if (!line.gap) return [];
      const start = line.text.toLowerCase().indexOf(line.gap.toLowerCase());
      if (start < 0) return [];
      const shown = line.text.slice(start, start + line.gap.length);
      const prompt = `${line.text.slice(0, start)}${BLANK}${line.text.slice(start + line.gap.length)}`;
      const options = getOptions(line.gap, cores, topic.id * 23 + i).map((o) => (o === line.gap ? shown : o));
      return [{ kind: "gap", prompt, hint: `Complete what ${line.speaker} says.`, answer: shown, options }];
    });
  }, [topic]);

  const pass = (check: "picture" | "situation" | "dialogue") => {
    setPassedChecks((list) => (list.includes(check) ? list : [...list, check]));
    if (isSignedIn) void setCourseBlockDone({ courseId: VOCAB_COURSE_ID, day: topic.id, blockId: check, isDone: true });
  };

  const handleSave = () => {
    if (!isSignedIn) {
      signInWithGoogle();
      return;
    }
    setSaveMessage(null);
    startSaving(async () => {
      const result = await savePhrasesToReview({
        phrases: topic.phrases.map((p) => ({ text: getPhraseCore(p.phrase), meaning: p.meaning, example: p.example, image: getPhrasePicture(topic, p) })),
      }).catch(() => null);
      setSaveMessage(result?.ok ? "Added to Review. You'll see them as picture flashcards." : "Couldn't save them. Please try again.");
    });
  };

  // Reads the conversation line by line, a different voice for each person.
  const playDialogue = () => {
    const lines = topic.dialogue?.lines ?? [];
    const run = ++dialogueRunRef.current;
    if (playingLine >= 0) {
      window.speechSynthesis?.cancel();
      setPlayingLine(-1);
      return;
    }
    const speakers = [...new Set(lines.map((line) => line.speaker))];
    const next = (index: number) => {
      if (run !== dialogueRunRef.current || index >= lines.length) {
        if (run === dialogueRunRef.current) setPlayingLine(-1);
        return;
      }
      setPlayingLine(index);
      speak(lines[index].text, speakers.indexOf(lines[index].speaker) % 2 === 0 ? "us" : "uk", RATE, () => next(index + 1));
    };
    next(0);
  };

  let step = 0;
  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <Step number={++step} title="Learn the phrases" hint="Look at each picture and tap it to hear the phrase in a sentence. Say it out loud after the voice.">
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={handleSave} disabled={isSaving} className="btn-3d btn-brand px-4 py-2 text-sm">
            <Icon name="plus" className="size-4" />
            Add all to Review
          </button>
        </div>
        {saveMessage && <p className="mb-3 text-sm font-semibold text-brand">{saveMessage}</p>}
        <ul lang="en" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {topic.phrases.map((p) => (
            <li key={p.phrase}>
              <button
                type="button"
                onClick={() => speak(p.example, "us", RATE)}
                aria-label={`Listen: ${p.example}`}
                className="w-full overflow-hidden rounded-2xl border border-line bg-cream text-left transition-colors hover:border-brand"
              >
                <Image src={getPhrasePicture(topic, p)} alt="" width={320} height={320} sizes="(min-width: 640px) 220px, 45vw" className="aspect-square w-full" />
                <span className="block p-2.5">
                  <span className="block font-bold leading-snug text-ink">{p.phrase}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted">{p.meaning}</span>
                  <span className="mt-1 block text-sm italic leading-snug text-ink">“{p.example}”</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Step>

      <Step number={++step} title="Match the picture" hint="Look at the picture and choose the phrase that goes with it.">
        <DayTest questions={pictureQuestions} videoId={null} onPass={() => pass("picture")} passMessage="Passed!" meaningLabel="Look at the picture" />
      </Step>

      {situationQuestions.length > 0 && (
        <Step number={++step} title="What would you say?" hint="Read the situation and choose what you would say.">
          <DayTest questions={situationQuestions} videoId={null} onPass={() => pass("situation")} passMessage="Passed!" meaningLabel="What would you say?" />
        </Step>
      )}

      {topic.dialogue && (
        <Step number={++step} title={topic.dialogue.title} hint="Listen to the conversation, then fill in the missing phrases.">
          <button type="button" onClick={playDialogue} className="btn-3d btn-brand px-4 py-2 text-sm">
            <Icon name={playingLine >= 0 ? "stop" : "volume"} className="size-4" />
            {playingLine >= 0 ? "Stop" : "Listen to the conversation"}
          </button>
          <ol lang="en" className="mt-3 space-y-1.5">
            {topic.dialogue.lines.map((line, i) => {
              const start = line.gap ? line.text.toLowerCase().indexOf(line.gap.toLowerCase()) : -1;
              const text = start >= 0 && line.gap ? `${line.text.slice(0, start)}${BLANK}${line.text.slice(start + line.gap.length)}` : line.text;
              return (
                <li key={i} className={`rounded-xl px-3 py-1.5 leading-relaxed transition-colors ${playingLine === i ? "bg-brand-soft" : ""}`}>
                  <span className="font-bold text-ink">{line.speaker}: </span>
                  <span className="text-ink">{passedChecks.includes("dialogue") ? line.text : text}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-4">
            <DayTest questions={dialogueQuestions} videoId={null} onPass={() => pass("dialogue")} passMessage="Passed!" />
          </div>
        </Step>
      )}

      {topic.speak && (
        <Step number={++step} title="Your turn" hint="Read the situation and say what you would say. Then compare with the example. Recordings stay on your device.">
          <ul lang="en" className="space-y-3">
            {topic.speak.map((task) => (
              <SpeakCard key={task.situation} situation={task.situation} answer={task.answer} />
            ))}
          </ul>
        </Step>
      )}

      {isDone && <p className="rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3 font-semibold text-brand">Topic done. Well done!</p>}

      <LessonNotes lessonKey={`vocab:${topic.slug}`} title={`Vocabulary: ${topic.title}`} href={`/words/${topic.slug}`} />

      {nextHref && (
        <div className="flex justify-end">
          <Link href={nextHref} className="btn-3d btn-brand px-5 py-2.5">
            Next topic
            <Icon name="chevronRight" className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function SpeakCard({ situation, answer }: { situation: string; answer: string }) {
  const [isShown, setIsShown] = useState(false);
  return (
    <li className="rounded-2xl border border-brand/30 bg-brand-soft/50 p-3">
      <p className="font-semibold leading-snug text-ink">{situation}</p>
      <div className="mt-2">
        <VoiceRecorder target={answer} recordLabel="Say it" />
      </div>
      {isShown ? (
        <p className="mt-2 flex items-center gap-2 text-ink">
          <span className="flex-1">
            <span className="text-sm font-semibold text-muted">Example: </span>
            {answer}
          </span>
          <button type="button" onClick={() => speak(answer, "us", RATE)} aria-label={`Listen: ${answer}`} className="grid size-9 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft">
            <Icon name="volume" className="size-5" />
          </button>
        </p>
      ) : (
        <button type="button" onClick={() => setIsShown(true)} className="mt-2 text-sm font-semibold text-brand hover:text-brand-dark">
          Show an example answer
        </button>
      )}
    </li>
  );
}
