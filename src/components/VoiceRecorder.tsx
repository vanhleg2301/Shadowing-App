"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { RecordingPlayer, playBlob } from "@/components/RecordingPlayer";
import { useRecorder } from "@/hooks/useRecorder";
import { checkDictation } from "@/lib/practice";
import { isSpeechRecognitionSupported } from "@/lib/speech-recognition";

interface VoiceRecorderProps {
  // When set, what the learner said is compared word by word with this sentence.
  target?: string;
  // Plays the original sentence; used by "Compare" before playing the learner's take.
  onPlayOriginal?: () => void;
  originalDurationSec?: number;
  onBeforeRecord?: () => void;
  onRecorded?: () => void;
  recordLabel?: string;
}

export function VoiceRecorder({
  target,
  onPlayOriginal,
  originalDurationSec = 0,
  onBeforeRecord,
  onRecorded,
  recordLabel = "Record",
}: VoiceRecorderProps) {
  const [canTranscribe, setCanTranscribe] = useState(false);
  const { isRecording, audioBlob, error, level, seconds, transcript, start, stop } = useRecorder({ transcribe: canTranscribe });

  useEffect(() => {
    // Feature detection only works in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanTranscribe(isSpeechRecognitionSupported());
  }, []);

  const handleRecord = () => {
    if (isRecording) {
      stop();
      onRecorded?.();
      return;
    }
    onBeforeRecord?.();
    start();
  };

  // Original first, then the learner's take, so the difference is easy to hear.
  const handleCompare = () => {
    if (!audioBlob || !onPlayOriginal) return;
    onPlayOriginal();
    setTimeout(() => playBlob(audioBlob), (originalDurationSec + 0.6) * 1000);
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
                Recording… <span className="font-mono text-muted">{seconds}s</span>
              </p>
              <p className="truncate text-sm text-muted">{transcript || "Speak now, then tap stop."}</p>
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
