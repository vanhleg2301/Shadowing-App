"use client";

import { useEffect, useRef, useState } from "react";
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
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch {
      setError("Can't access the microphone. Please allow microphone access in your browser.");
      return;
    }

    const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];

    // Live input level for the meter, from a Web Audio analyser on the same stream.
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;
    const startedAt = Date.now();
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (const s of samples) peak = Math.max(peak, Math.abs(s - 128) / 128);
      setLevel(Math.min(1, peak * 1.6));
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) stop();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    cleanupRef.current = () => {
      cancelAnimationFrame(frame);
      stream.getTracks().forEach((track) => track.stop());
      audioContext.close();
      transcriberRef.current?.stop();
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
