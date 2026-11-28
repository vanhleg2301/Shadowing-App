"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { QuickTopic } from "@/data/quick-answers";
import type { LineNarration } from "@/lib/story-audio";
import { QuickAnswers } from "./QuickAnswers";

interface QuickAnswersPickerProps {
  topics: { topic: QuickTopic; narration: LineNarration | null }[];
}

export function QuickAnswersPicker({ topics }: QuickAnswersPickerProps) {
  const [open, setOpen] = useState<string | null>(null);
  const current = topics.find((t) => t.topic.slug === open);
  return (
    <>
      <ul className="stagger mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topics.map(({ topic }) => (
          <li key={topic.slug}>
            <button
              type="button"
              onClick={() => setOpen(topic.slug)}
              className="pressable flex w-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left hover:border-brand"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon name="mic" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold text-ink">{topic.topic}</span>
                <span className="block text-sm text-muted">{topic.questions.length} questions · about 5 min</span>
              </span>
              <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>
      {current && <QuickAnswers key={current.topic.slug} topic={current.topic} narration={current.narration} onClose={() => setOpen(null)} />}
    </>
  );
}
