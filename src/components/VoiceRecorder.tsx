"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { RecordingPlayer, playBlob } from "@/components/RecordingPlayer";
import { useRecorder } from "@/hooks/useRecorder";
import { prewarmMic } from "@/lib/mic";
import { checkDictation } from "@/lib/practice";
import { isSpeechRecognitionSupported } from "@/lib/speech-recognition";

interface VoiceRecorderProps {
  // When set, what the learner said is compared word by word with this sentence.
  target?: string;
  // Plays the original sentence and resolves when it ends; used by "Compare" and the auto cycle.
  onPlayOriginal?: () => Promise<void> | void;
  originalDurationSec?: number;
  onBeforeRecord?: () => void;
  onRecorded?: () => void;
  recordLabel?: string;
  // Shows "Listen & repeat": original, then a timed recording, then your take, hands-free.
  hasAutoCycle?: boolean;
}

type AutoPhase = "idle" | "listening" | "recording";

export function VoiceRecorder({
  target,
  onPlayOriginal,
  originalDurationSec = 0,
  onBeforeRecord,
  onRecorded,
  recordLabel = "Record",
  hasAutoCycle = false,
}: VoiceRecorderProps) {
  const [canTranscribe, setCanTranscribe] = useState(false);
  const { isRecording, audioBlob, error, level, seconds, transcript, start, stop } = useRecorder({ transcribe: canTranscribe });

  const [autoPhase, setAutoPhase] = useState<AutoPhase>("idle");
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRunRef = useRef(0);
  const blobBeforeAutoRef = useRef<Blob | null>(null);

  useEffect(() => {
    // Feature detection only works in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanTranscribe(isSpeechRecognitionSupported());
    if (target) prewarmMic();
  }, [target]);

  useEffect(
    () => () => {
      autoRunRef.current++;
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    },
    [],
  );

  // The auto cycle plays your take as soon as its timed recording is saved.
  useEffect(() => {
    if (autoPhase !== "recording" || isRecording || !audioBlob || audioBlob === blobBeforeAutoRef.current) return;
    setAutoPhase("idle");
    playBlob(audioBlob);
  }, [autoPhase, isRecording, audioBlob]);

  const cancelAuto = () => {
    autoRunRef.current++;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
    setAutoPhase("idle");
  };

  const handleAutoCycle = async () => {
    if (autoPhase !== "idle") {
      cancelAuto();
      if (isRecording) stop();
      return;
    }
    const run = ++autoRunRef.current;
    setAutoPhase("listening");
    await onPlayOriginal?.();
    if (run !== autoRunRef.current) return;
    blobBeforeAutoRef.current = audioBlob;
    setAutoPhase("recording");
    onBeforeRecord?.();
    await start();
    // Enough time to repeat the sentence at a relaxed pace.
    autoTimerRef.current = setTimeout(() => {
      if (run === autoRunRef.current) stop();
    }, (originalDurationSec * 1.5 + 1.2) * 1000);
  };

  const handleRecord = () => {
    if (autoPhase !== "idle") cancelAuto();
    if (isRecording) {
      stop();
      onRecorded?.();
      return;
    }
    onBeforeRecord?.();
    start();
  };

  // Original first, then the learner's take, so the difference is easy to hear.
  const handleCompare = async () => {
    if (!audioBlob || !onPlayOriginal) return;
    const played = onPlayOriginal();
    if (played) await played;
    else await new Promise((resolve) => setTimeout(resolve, (originalDurationSec + 0.6) * 1000));
    await new Promise((resolve) => setTimeout(resolve, 250));
    playBlob(audioBlob);
  };

  const result = target && transcript && !isRecording ? checkDictation(target, transcript) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleRecord}
          aria-label={isRecording ? "Stop recording" : recordLabel}
          className={`relative grid size-14 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-95 ${
            isRecording ? "bg-red-600" : "bg-brand text-on-brand"
          }`}
        >
          {/* Ring grows with the microphone level while recording. */}
          {isRecording && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-red-500/30 transition-transform duration-75"
              style={{ transform: `scale(${1 + level * 0.6})` }}
            />
          )}
          <Icon name={isRecording ? "stop" : "mic"} className="relative size-6" />
        </button>
        <div className="min-w-0 flex-1">
          {isRecording ? (
            <>
              <p className="font-semibold text-ink">
                {autoPhase === "recording" ? "Your turn, repeat now" : "Recording…"}{" "}
                <span className="font-mono text-muted">{seconds}s</span>
              </p>
              <p className="truncate text-sm text-muted">{transcript || "Speak now, then tap stop."}</p>
            </>
          ) : autoPhase === "listening" ? (
            <>
              <p className="font-semibold text-ink">Listen carefully…</p>
              <p className="text-sm text-muted">Recording starts when the sentence ends.</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">{audioBlob ? "Try again or compare" : recordLabel}</p>
              <p className="text-sm text-muted">
                {audioBlob ? "Listen to yourself, then record once more." : "Tap the mic and say it out loud."}
              </p>
            </>
          )}
        </div>
        {audioBlob && onPlayOriginal && !isRecording && (
          <button type="button" onClick={handleCompare} className="btn-3d shrink-0 px-3 py-2 text-sm">
            <Icon name="repeat" className="size-4" />
            Compare
          </button>
        )}
      </div>

      {hasAutoCycle && onPlayOriginal && (
        <button
          type="button"
          onClick={handleAutoCycle}
          aria-pressed={autoPhase !== "idle"}
          className={`btn-3d w-full py-2.5 text-sm ${autoPhase !== "idle" ? "" : "btn-soft"}`}
        >
          <Icon name={autoPhase !== "idle" ? "stop" : "repeat"} className="size-4" />
          {autoPhase !== "idle" ? "Stop" : "Listen & repeat (hands-free)"}
        </button>
      )}

      {audioBlob && !isRecording && <RecordingPlayer blob={audioBlob} label="Your voice" />}

      {!isRecording && transcript && (
        <div className="animate-fade-in rounded-2xl border border-line bg-surface p-3 text-sm">
          {result ? (
            <>
              <p className={`font-bold ${result.score >= 80 ? "text-brand" : "text-accent"}`}>
                {result.score >= 90 ? "Very clear!" : result.score >= 70 ? "Good — almost there" : "Keep practising"} · {result.score}% of
                words recognised
              </p>
              <p className="mt-1 leading-relaxed">
                {result.words.map((w, i) => (
                  <span key={i} className={w.isCorrect ? "text-ink" : "rounded bg-accent-soft px-0.5 text-accent underline decoration-dotted"}>
                    {w.text}{" "}
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs text-muted">Underlined words weren&apos;t heard clearly. Heard: “{transcript}”</p>
            </>
          ) : (
            <p className="text-ink">
              <span className="font-semibold text-muted">We heard: </span>“{transcript}”
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
