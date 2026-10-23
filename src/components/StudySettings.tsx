"use client";

import { useEffect, useState, useTransition } from "react";
import { updateSettings } from "@/app/actions";
import { disableReminders, enableReminders, getPushSupport, type PushSupport } from "@/lib/push";
import type { UserSettings } from "@/lib/user-data";

const GOALS = [5, 10, 15, 20, 30, 45, 60] as const;

const ERROR_TEXT: Record<string, string> = {
  denied: "Notifications are blocked. Allow them for this site in your browser settings.",
  "not-configured": "Reminders aren't set up on this server yet.",
};

interface StudySettingsProps {
  initial: UserSettings;
}

export function StudySettings({ initial }: StudySettingsProps) {
  const [goal, setGoal] = useState(initial.dailyGoalMinutes);
  const [isReminding, setIsReminding] = useState(initial.remindersEnabled);
  const [support, setSupport] = useState<PushSupport>("unsupported");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Feature detection only works in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupport(getPushSupport());
  }, []);

  const handleGoal = (minutes: (typeof GOALS)[number]) => {
    const previous = goal;
    setGoal(minutes);
    setMessage(null);
    startTransition(async () => {
      const result = await updateSettings({ dailyGoalMinutes: minutes });
      if (!result.ok) {
        setGoal(previous);
        setMessage("Couldn't save your goal. Please try again.");
      }
    });
  };

  const handleReminders = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = isReminding ? await disableReminders() : await enableReminders();
        if (result.ok) {
          setIsReminding(!isReminding);
          if (!isReminding) setMessage("Done. We'll remind you in the evening if you haven't reached your goal.");
        } else {
          setMessage(ERROR_TEXT[result.error] ?? "Something went wrong. Please try again.");
        }
      } catch {
        setMessage("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <section id="goal" className="scroll-mt-24 rounded-3xl border border-line bg-surface p-5">
      <h2 className="text-lg font-bold text-ink">Daily goal</h2>
      <p className="mt-1 text-sm text-muted">Minutes of active study per day: watching, shadowing, the course and review.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Daily goal in minutes">
        {GOALS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            role="radio"
            aria-checked={goal === minutes}
            disabled={isPending}
            onClick={() => handleGoal(minutes)}
            className={`min-h-11 min-w-14 rounded-xl border-2 px-3 text-sm font-bold transition-colors ${
              goal === minutes ? "border-brand bg-brand text-on-brand" : "border-line bg-cream text-ink hover:border-brand"
            }`}
          >
            {minutes} min
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ink">Evening reminder</h3>
          <p className="text-sm text-muted">
            {support === "needs-install"
              ? "On iPhone, tap Share → Add to Home Screen, open the app from there, then turn this on."
              : support === "unsupported"
                ? "This browser can't show notifications."
                : "One notification around 7 pm (Vietnam time) on days you haven't reached your goal."}
          </p>
        </div>
        {support === "supported" && (
          <button
            type="button"
            role="switch"
            aria-checked={isReminding}
            aria-label="Evening reminder"
            disabled={isPending}
            onClick={handleReminders}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${isReminding ? "bg-brand" : "bg-line"}`}
          >
            <span
              className={`absolute top-1 size-6 rounded-full bg-surface shadow transition-[left] ${isReminding ? "left-7" : "left-1"}`}
            />
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-brand">{message}</p>}
    </section>
  );
}
