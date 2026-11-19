"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { useRecorder } from "@/hooks/useRecorder";
import { deletePlanRecording, isRecordingStoreSupported, listPlanRecordings, savePlanRecording, type PlanRecording } from "@/lib/plan-recordings";

const MAX_SECONDS = 180;

interface WeeklyRecorderProps {
  weekStart: string;
  title: string;
  onSaved: () => void;
}

// Records the learner talking for about 2 minutes and keeps it on this device for later comparison.
export function WeeklyRecorder({ weekStart, title, onSaved }: WeeklyRecorderProps) {
  const { isRecording, audioBlob, error, seconds, start, stop } = useRecorder({ maxSeconds: MAX_SECONDS });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const save = async () => {
    if (!audioBlob) return;
    setStatus("saving");
    try {
      await savePlanRecording({ weekStart, title, savedAt: new Date().toISOString(), blob: audioBlob });
      setStatus("saved");
      onSaved();
    } catch {
      setStatus("failed");
    }
  };

  const toggle = () => {
    if (isRecording) return stop();
    setStatus("idle");
    void start();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={isRecording ? "Stop recording" : "Record your weekly talk"}
          className={`grid size-14 shrink-0 place-items-center rounded-full transition-transform active:scale-95 ${isRecording ? "bg-red-600 text-white" : "bg-brand text-on-brand"}`}
        >
          <Icon name={isRecording ? "stop" : "mic"} className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">
            {isRecording ? (
              <>
                Recording… <span className="font-mono text-muted">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
              </>
            ) : audioBlob ? (
              "Listen back, then save it"
            ) : (
              "Talk for about 2 minutes"
            )}
          </p>
          <p className="text-sm text-muted">{isRecording ? "Tap stop when you finish. It stops by itself at 3 minutes." : "The recording stays on this device only."}</p>
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {audioBlob && !isRecording && (
        <>
          <RecordingPlayer blob={audioBlob} label="Your talk" />
          <button type="button" onClick={() => void save()} disabled={status === "saving" || status === "saved"} className="btn-3d btn-brand w-full py-2.5 text-sm">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved on this device" : "Save this week's recording"}
          </button>
          {status === "failed" && <p className="text-sm font-semibold text-red-600">Couldn&apos;t save it in this browser.</p>}
        </>
      )}
    </div>
  );
}

const formatWeek = (weekStart: string) =>
  new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// Every saved weekly recording, newest first, so week 1 and week 6 can be heard side by side.
export function RecordingShelf({ version }: { version: number }) {
  const [recordings, setRecordings] = useState<PlanRecording[] | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [deletingWeek, setDeletingWeek] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    if (!isRecordingStoreSupported()) {
      // Feature detection only works in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(false);
      return;
    }
    void listPlanRecordings()
      .catch(() => [])
      .then((list) => {
        if (isCurrent) setRecordings(list);
      });
    return () => {
      isCurrent = false;
    };
  }, [version]);

  const remove = async (weekStart: string) => {
    setDeletingWeek(null);
    await deletePlanRecording(weekStart).catch(() => undefined);
    setRecordings((list) => list?.filter((r) => r.weekStart !== weekStart) ?? null);
  };

  return (
    <section aria-label="Your weekly recordings" className="mt-6 rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-lg font-extrabold text-ink">Your weekly recordings</h2>
      <p className="mt-1 text-sm text-muted">Listen to your first week next to your latest one. Kept on this device only.</p>
      {!isSupported ? (
        <p className="mt-3 text-sm text-muted">This browser can&apos;t keep recordings.</p>
      ) : recordings === null ? (
        <div className="mt-3 h-16 animate-pulse rounded-2xl bg-cream" />
      ) : recordings.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No recordings yet. Your first one comes on Saturday.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {recordings.map((recording) => (
            <li key={recording.weekStart} className="rounded-2xl bg-cream p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-bold text-ink">
                  Week of {formatWeek(recording.weekStart)} · <span className="font-normal text-muted">{recording.title}</span>
                </p>
                <button type="button" onClick={() => setDeletingWeek(recording.weekStart)} aria-label="Delete recording" className="shrink-0 p-1 text-muted hover:text-ink">
                  <Icon name="close" className="size-4" />
                </button>
              </div>
              <RecordingPlayer blob={recording.blob} label={`Week of ${formatWeek(recording.weekStart)}`} />
            </li>
          ))}
        </ul>
      )}
      {deletingWeek && (
        <ConfirmDialog
          title="Delete this recording?"
          message="It is removed from this device for good."
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => void remove(deletingWeek)}
          onCancel={() => setDeletingWeek(null)}
        />
      )}
    </section>
  );
}
