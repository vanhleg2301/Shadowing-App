"use client";

import { Icon } from "@/components/Icon";
import { speak } from "@/lib/speech";
import type { DayGuide, StudySentence } from "@/lib/video-study";

interface VideoGuideSectionProps {
  guide: DayGuide;
  onHear: (sentence: StudySentence) => void;
}

// The whole video at a glance: what it covers, its parts in order with lines said in it, and a model to copy.
export function VideoGuideSection({ guide, onHear }: VideoGuideSectionProps) {
  return (
    <div lang="en" className="space-y-4">
      <p className="leading-relaxed text-ink">{guide.overview}</p>

      <ol className="space-y-3">
        {guide.sections.map((section, i) => (
          <li key={section.title} className="rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center gap-2 font-extrabold text-ink">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>
              {section.title}
            </p>
            <ul className="mt-2 space-y-1.5">
              {section.lines.map((line) => (
                <li key={line.index} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onHear(line)}
                    aria-label={`Hear “${line.text}” in the video`}
                    className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
                  >
                    <Icon name="play" className="size-3.5" />
                  </button>
                  <p className="leading-relaxed text-ink/90">{line.text}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-brand/30 bg-brand-soft/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-extrabold text-ink">Model: {guide.model.title}</p>
          <button
            type="button"
            onClick={() => speak(guide.model.text.replace(/[[\]]/g, ""), "us", 0.85)}
            aria-label="Read the model aloud"
            className="grid size-9 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
          >
            <Icon name="volume" className="size-5" />
          </button>
        </div>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-ink">{guide.model.text}</p>
        <p className="mt-2 text-xs text-muted">Change the parts in [brackets] to your own details, then say it out loud in the Speak step.</p>
      </div>
    </div>
  );
}
