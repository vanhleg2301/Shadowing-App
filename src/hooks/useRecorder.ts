"use client";

import { useEffect, useRef, useState } from "react";
import { acquireMic, releaseMic } from "@/lib/mic";
import { startTranscriber, type Transcriber } from "@/lib/speech-recognition";

const MAX_SECONDS = 90;
// Safari/iOS records AAC in MP4; Chrome, Edge and Firefox record Opus in WebM.
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"];

interface RecorderOptions {
  // Also transcribe with the browser's free speech recognition, when available.
  transcribe?: boolean;
}

export function useRecorder({ transcribe = false }: RecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const transcriberRef = useRef<Transcriber | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const stop = () => {
    transcriberRef.current?.stop();
    transcriberRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const start = async () => {
    setError(null);
    setTranscript("");
    let mic: Awaited<ReturnType<typeof acquireMic>>;
    try {
      mic = await acquireMic();
    } catch {
      setError("Can't access the microphone. Please allow microphone access in your browser.");
      return;
    }

    const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(mic.stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];

    // Live input level for the meter. State only changes when the level moves visibly or a new
    // second starts, so the component doesn't re-render on every animation frame.
    const samples = new Uint8Array(mic.analyser.fftSize);
    let frame = 0;
    let shownLevel = 0;
    let shownSeconds = 0;
    const startedAt = performance.now();
    const tick = () => {
      mic.analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (const s of samples) peak = Math.max(peak, Math.abs(s - 128) / 128);
      const nextLevel = Math.round(Math.min(1, peak * 1.6) * 10) / 10;
      if (nextLevel !== shownLevel) {
        shownLevel = nextLevel;
        setLevel(nextLevel);
      }
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);
      if (elapsed !== shownSeconds) {
        shownSeconds = elapsed;
        setSeconds(elapsed);
      }
      if (elapsed >= MAX_SECONDS) stop();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    let isReleased = false;
    cleanupRef.current = () => {
      cancelAnimationFrame(frame);
      transcriberRef.current?.stop();
      if (recorder.state === "recording") recorder.stop();
      if (!isReleased) {
        isReleased = true;
        releaseMic();
      }
    };

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setLevel(0);
      setAudioBlob(new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" }));
      setIsRecording(false);
    };
    recorder.start();
    recorderRef.current = recorder;
    setSeconds(0);
    setIsRecording(true);

    if (transcribe) {
      transcriberRef.current = startTranscriber(setTranscript, () => {
        // Recognition is a bonus; the recording itself still works.
      });
    }
  };

  return { isRecording, audioBlob, error, level, seconds, transcript, start, stop };
}
