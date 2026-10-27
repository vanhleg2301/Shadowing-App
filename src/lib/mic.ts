"use client";

// One shared microphone stream and analyser for the whole page. Asking for the mic every time
// costs a noticeable delay (and on some phones a fresh permission prompt), and the shadowing
// recorder remounts for every sentence, so the stream is kept warm between recordings and only
// released after a quiet minute. On iPhone/iPad an open mic switches Safari to its call audio mode,
// which makes the video quieter, so there it is released right after each recording.
const IDLE_RELEASE_MS = 60_000;

function isAppleMobile(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

interface Mic {
  stream: MediaStream;
  audioContext: AudioContext;
  analyser: AnalyserNode;
}

let micPromise: Promise<Mic> | null = null;
let users = 0;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

async function openMic(): Promise<Mic> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
  });
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  audioContext.createMediaStreamSource(stream).connect(analyser);
  return { stream, audioContext, analyser };
}

function isLive(mic: Mic): boolean {
  return mic.stream.getAudioTracks().some((track) => track.readyState === "live");
}

export async function acquireMic(): Promise<Mic> {
  users++;
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  if (micPromise) {
    const mic = await micPromise.catch(() => null);
    if (mic && isLive(mic)) {
      if (mic.audioContext.state === "suspended") await mic.audioContext.resume();
      return mic;
    }
    micPromise = null;
  }
  micPromise = openMic();
  try {
    return await micPromise;
  } catch (error) {
    micPromise = null;
    users = Math.max(0, users - 1);
    throw error;
  }
}

export function releaseMic() {
  users = Math.max(0, users - 1);
  if (users > 0 || releaseTimer) return;
  releaseTimer = setTimeout(async () => {
    releaseTimer = null;
    if (users > 0 || !micPromise) return;
    const mic = await micPromise.catch(() => null);
    micPromise = null;
    mic?.stream.getTracks().forEach((track) => track.stop());
    mic?.audioContext.close();
  }, isAppleMobile() ? 0 : IDLE_RELEASE_MS);
}

// Opens the mic ahead of the first tap when permission was already granted, so recording starts
// instantly. Never prompts, and skipped on iPhone/iPad (see above).
export async function prewarmMic() {
  if (isAppleMobile() || !navigator.permissions) return;
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    if (status.state !== "granted") return;
    await acquireMic();
    releaseMic();
  } catch {
    // Not supported or blocked: the mic opens on the first tap instead.
  }
}
