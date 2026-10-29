"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { addVideoNote, deleteVideoNote } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PartNav } from "@/components/PartNav";
import { Icon } from "@/components/Icon";
import { VideoFacade } from "@/components/VideoFacade";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import type { TimePart } from "@/lib/lesson-parts";
import type { VideoNote } from "@/lib/user-data";

interface ListenNotesPlayerProps {
  videoId: string;
  title: string;
  // null when signed out: notes are kept in this browser only.
  initialNotes: VideoNote[] | null;
  backHref: string;
  // Long videos are played in ~5-minute slices.
  part?: TimePart;
  partQuery?: string;
}

const SKIP_S = 5;
const RATES = [1, 0.9, 0.75];

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function readLocalNotes(videoId: string): VideoNote[] {
  try {
    return JSON.parse(localStorage.getItem(`notes:${videoId}`) ?? "[]") as VideoNote[];
  } catch {
    return [];
  }
}

function writeLocalNotes(videoId: string, notes: VideoNote[]) {
  try {
    localStorage.setItem(`notes:${videoId}`, JSON.stringify(notes));
  } catch {
    // Storage blocked: the notes last until the page closes.
  }
}

// For videos without a stored transcript: listen with replay tools and write down what you hear,
// each note pinned to the moment in the video so it can be replayed.
export function ListenNotesPlayer({ videoId, title, initialNotes, backHref, part, partQuery = "" }: ListenNotesPlayerProps) {
  const { containerRef, isActivated, isReady, isPlaying, currentTime, play, pause, seekTo, setRate } = useYouTubePlayer(videoId, part?.start ?? 0);
  const isSignedIn = initialNotes !== null;
  const [notes, setNotes] = useState<VideoNote[]>(initialNotes ?? []);
  const [draft, setDraft] = useState("");
  const [draftAt, setDraftAt] = useState<number | null>(null);
  const [loop, setLoop] = useState<{ start: number; end: number | null } | null>(null);
  const [rateIndex, setRateIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    // localStorage is only readable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isSignedIn) setNotes(readLocalNotes(videoId));
  }, [isSignedIn, videoId]);

  useEffect(() => {
    if (loop?.end != null && currentTime >= loop.end) seekTo(loop.start);
  }, [currentTime, loop, seekTo]);

  const isPartOver = part !== undefined && currentTime >= part.end;
  useEffect(() => {
    if (isPartOver && isPlaying && !loop) pause();
  }, [isPartOver, isPlaying, loop, pause]);
  const partHref = (index: number) => `/watch/${videoId}?${partQuery ? `${partQuery}&` : ""}part=${index}`;

  const skip = (delta: number) => seekTo(Math.max(part?.start ?? 0, currentTime + delta));

  const handleLoop = () => {
    if (!loop) setLoop({ start: currentTime, end: null });
    else if (loop.end === null && currentTime > loop.start + 0.5) setLoop({ ...loop, end: currentTime });
    else setLoop(null);
  };

  const handleRate = () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    setRate(RATES[next]);
  };

  // The note is pinned to when the learner started writing, not when they pressed save.
  const handleDraftFocus = () => {
    if (draftAt === null) setDraftAt(currentTime);
  };

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;
    const atSec = draftAt ?? currentTime;
    setError(null);
    const insert = (note: VideoNote) => {
      const next = [...notes, note].sort((a, b) => a.atSec - b.atSec);
      setNotes(next);
      if (!isSignedIn) writeLocalNotes(videoId, next);
      setDraft("");
      setDraftAt(null);
    };
    if (!isSignedIn) {
      insert({ id: `local-${Date.now()}`, atSec, text });
      return;
    }
    startSaving(async () => {
      const result = await addVideoNote({ videoId, atSec, text });
      if (!result.ok) {
        setError("Couldn't save the note. Please try again.");
        return;
      }
      insert({ id: result.id, atSec, text });
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(null);
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (!isSignedIn) writeLocalNotes(videoId, next);
    else void deleteVideoNote({ id });
  };

  const replayNote = (note: VideoNote) => {
    // Start a little earlier so the phrase isn't cut off.
    seekTo(Math.max(0, note.atSec - 2));
    play();
  };

  const loopLabel = !loop ? "Loop A–B" : loop.end === null ? `A ${formatTime(loop.start)} · set B` : `Looping ${formatTime(loop.start)}–${formatTime(loop.end)}`;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col">
      <header className="flex items-center gap-2.5 border-b border-line bg-cream px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] sm:px-4">
        <Link href={backHref} aria-label={backHref === "/" ? "Back to home" : "Back to the course"} className="btn-3d size-10 shrink-0 rounded-full">
          <Icon name="back" className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold text-ink">{title}</h1>
          <p className="truncate text-sm text-muted">
            {part ? `Part ${part.index} of ${part.total} · ` : ""}No subtitles yet · listen and take notes
          </p>
        </div>
      </header>

      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black sm:mt-4 sm:rounded-3xl">
        <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
        {!isActivated && <VideoFacade videoId={videoId} onPlay={play} />}
        {!isReady && <p className="absolute inset-0 grid place-items-center text-sm text-white/60">Loading video...</p>}
      </div>

      <div className="shrink-0 border-b border-line bg-surface px-3 py-3 sm:px-4">
        <div className="grid grid-cols-5 gap-2">
          <button type="button" className="btn-3d py-3 text-sm font-bold" onClick={() => skip(-SKIP_S)} aria-label={`Back ${SKIP_S} seconds`}>
            −{SKIP_S}s
          </button>
          <button type="button" className="btn-3d btn-brand py-3" onClick={isPlaying ? pause : play} aria-label={isPlaying ? "Pause" : "Play"}>
            <Icon name={isPlaying ? "pause" : "play"} className="size-6" />
          </button>
          <button type="button" className="btn-3d py-3 text-sm font-bold" onClick={() => skip(SKIP_S)} aria-label={`Forward ${SKIP_S} seconds`}>
            +{SKIP_S}s
          </button>
          <button type="button" className={`btn-3d py-3 ${loop ? "btn-soft" : ""}`} onClick={handleLoop} aria-label={loopLabel}>
            <Icon name="repeat" className="size-5" />
          </button>
          <button type="button" className="btn-3d py-3 text-sm font-bold" onClick={handleRate} aria-label="Playback speed">
            {RATES[rateIndex]}×
          </button>
        </div>
        <p className="mt-2 text-center text-xs font-semibold text-muted" aria-live="polite">
          {formatTime(currentTime)} · {loopLabel}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-cream px-3 py-3 sm:px-4">
        {part && <PartNav index={part.index} total={part.total} href={partHref} isOver={isPartOver} />}
        {notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Write down words and phrases you hear. Each note remembers the moment, so you can tap it to hear that part again.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="flex items-start gap-2 rounded-2xl border border-line bg-surface p-2.5">
                <button
                  type="button"
                  onClick={() => replayNote(note)}
                  className="shrink-0 rounded-xl bg-brand-soft px-2.5 py-1.5 text-xs font-bold text-brand"
                  aria-label={`Replay from ${formatTime(note.atSec)}`}
                >
                  ▶ {formatTime(note.atSec)}
                </button>
                <p className="min-w-0 flex-1 whitespace-pre-wrap break-words py-1 text-ink">{note.text}</p>
                <button type="button" onClick={() => setDeletingId(note.id)} className="shrink-0 p-1.5 text-muted hover:text-ink" aria-label="Delete note">
                  <Icon name="close" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {!isSignedIn && notes.length > 0 && <p className="mt-3 text-xs text-muted">Notes are saved on this device. Sign in to keep them everywhere.</p>}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
        className="shrink-0 border-t border-line bg-surface px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2.5 sm:px-4"
      >
        {error && <p className="mb-2 text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-xs font-bold text-muted">Note at {formatTime(draftAt ?? currentTime)}</span>
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (!event.target.value) setDraftAt(null);
              }}
              onFocus={handleDraftFocus}
              rows={1}
              maxLength={500}
              placeholder="What did you hear?"
              className="block max-h-28 w-full resize-none rounded-2xl border border-line bg-cream px-3 py-2.5 text-base text-ink outline-none focus:border-brand"
            />
          </label>
          <button type="submit" disabled={!draft.trim() || isSaving} className="btn-3d btn-brand shrink-0 px-4 py-2.5 text-sm">
            {isSaving ? "Saving..." : "Add"}
          </button>
        </div>
      </form>
      {deletingId && (
        <ConfirmDialog
          title="Delete this note?"
          message="The note is removed for good."
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
