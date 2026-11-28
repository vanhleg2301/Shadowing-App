"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { savePhrasesToReview, setCourseBlockDone } from "@/app/actions";
import { Icon } from "@/components/Icon";
import { ChoiceQuiz, type ChoiceQuestion } from "@/components/lesson/ChoiceQuiz";
import { LessonPath, type LessonStage } from "@/components/lesson/LessonPath";
import { LessonNotes } from "@/components/LessonNotes";
import { useAuth } from "@/hooks/useAuth";
import { useLinePlayer } from "@/hooks/useLinePlayer";
import type { LineNarration } from "@/lib/story-audio";
import { VOCAB_COURSE_ID, getPhraseCore, getPhrasePicture, type VocabTopic } from "@/data/vocabulary";
import { shuffle } from "@/lib/day-test";
import { ConversationBuilder } from "./ConversationBuilder";
import { PhraseDeck } from "./PhraseDeck";
import { SpeakSession } from "./SpeakSession";

interface VocabTopicViewProps {
  topic: VocabTopic;
  // Kokoro recording of the phrases, examples, conversation and model answers (the voice of the daily stories).
  narration: LineNarration | null;
  isSignedIn: boolean;
  // Parts already finished: learn, picture, situation, dialogue, speak.
  passed: string[];
  nextHref: string | null;
}

type StageId = "learn" | "picture" | "situation" | "dialogue" | "speak";

const QUIZ_LENGTH = 8;

// Three other phrases of the topic, and the answer, in a stable order.
function getOptions(answer: string, all: string[], seed: number): string[] {
  const others = shuffle(
    all.filter((text) => text !== answer),
    seed,
  ).slice(0, 3);
  return shuffle([answer, ...others], seed + 50);
}

// A vocabulary topic as a path of parts, each opened on its own focus screen: learn what you say and what you
// hear, match the pictures, choose what is said in a situation, build a conversation, then say it yourself.
export function VocabTopicView({ topic, narration, isSignedIn, passed, nextHref }: VocabTopicViewProps) {
  const { voice, audioProps } = useLinePlayer(narration);
  const { signInWithGoogle } = useAuth();
  const [done, setDone] = useState(passed);
  const [open, setOpen] = useState<StageId | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const pictureQuestions = useMemo<ChoiceQuestion[]>(
    () =>
      shuffle(topic.phrases, topic.id * 11)
        .slice(0, QUIZ_LENGTH)
        .map((p, i) => ({
          label: "Look at the picture",
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
  const situationQuestions = useMemo<ChoiceQuestion[]>(
    () =>
      shuffle(
        topic.phrases.filter((p) => p.situation),
        topic.id * 17,
      )
        .slice(0, QUIZ_LENGTH)
        .map((p, i) => ({
          label: p.role === "hear" ? "What will you hear?" : "What would you say?",
          prompt: p.situation ?? "",
          answer: p.phrase,
          // The other options are said by the same side, so the situation decides, not who speaks.
          options: getOptions(
            p.phrase,
            topic.phrases.filter((o) => o.role === p.role).map((o) => o.phrase),
            topic.id * 19 + i,
          ),
        })),
    [topic],
  );

  const finishStage = (id: StageId) => {
    setDone((list) => (list.includes(id) ? list : [...list, id]));
    if (isSignedIn) void setCourseBlockDone({ courseId: VOCAB_COURSE_ID, day: topic.id, blockId: id, isDone: true });
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
      setSaveMessage(result?.ok ? "Added to Review as picture flashcards." : "Couldn't save them. Please try again.");
    });
  };

  const noun = topic.kind === "words" ? "words" : "phrases";
  const stages: LessonStage[] = [
    { id: "learn", title: "Learn", detail: `${topic.phrases.length} ${noun} with pictures`, icon: "book", isDone: done.includes("learn") },
    { id: "picture", title: "Match the picture", detail: `${pictureQuestions.length} questions`, icon: "search", isDone: done.includes("picture") },
  ];
  if (situationQuestions.length > 0) {
    stages.push({ id: "situation", title: "What would you say?", detail: `${situationQuestions.length} situations`, icon: "chat", isDone: done.includes("situation") });
  }
  if (topic.dialogue) {
    stages.push({ id: "dialogue", title: "Build the conversation", detail: `You are ${topic.dialogue.you}`, icon: "chat", isDone: done.includes("dialogue") });
  }
  if (topic.speak) stages.push({ id: "speak", title: "Your turn", detail: "Say it out loud", icon: "mic", isDone: done.includes("speak") });
  const isComplete = stages.every((stage) => stage.isDone);
  const close = () => setOpen(null);

  const saveButton = (
    <>
      <button type="button" onClick={handleSave} disabled={isSaving} className="btn-3d py-3">
        <Icon name="plus" className="size-4" />
        Add all to Review
      </button>
      {saveMessage && <p className="text-sm font-semibold text-brand">{saveMessage}</p>}
    </>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <LessonPath stages={stages} onOpen={(id) => setOpen(id as StageId)} />

      {isComplete && <p className="rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3 font-semibold text-brand">Topic done. Well done!</p>}

      <div className="flex flex-col gap-2">{saveButton}</div>

      <LessonNotes lessonKey={`vocab:${topic.slug}`} title={`Vocabulary: ${topic.title}`} href={`/words/${topic.slug}`} />

      {nextHref && (
        <div className="flex justify-end">
          <Link href={nextHref} className="btn-3d px-5 py-2.5">
            Next topic
            <Icon name="chevronRight" className="size-4" />
          </Link>
        </div>
      )}

      <audio {...audioProps} />
      {open === "learn" && <PhraseDeck topic={topic} onClose={close} onDone={() => finishStage("learn")} finish={saveButton} voice={voice} />}
      {open === "picture" && (
        <ChoiceQuiz title="Match the picture" questions={pictureQuestions} onClose={close} onPass={() => finishStage("picture")} voice={voice} />
      )}
      {open === "situation" && (
        <ChoiceQuiz title="What would you say?" questions={situationQuestions} onClose={close} onPass={() => finishStage("situation")} voice={voice} />
      )}
      {open === "dialogue" && topic.dialogue && (
        <ConversationBuilder
          title={topic.dialogue.title}
          you={topic.dialogue.you}
          lines={topic.dialogue.lines}
          seed={topic.id * 29}
          onClose={close}
          onPass={() => finishStage("dialogue")}
          voice={voice}
        />
      )}
      {open === "speak" && topic.speak && <SpeakSession tasks={topic.speak} onClose={close} onDone={() => finishStage("speak")} voice={voice} />}
    </div>
  );
}
