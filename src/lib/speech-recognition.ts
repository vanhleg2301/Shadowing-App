// Free speech-to-text through the browser's Web Speech API (Chrome, Edge, Safari incl. iOS 14.5+).
// Chrome and Safari send the audio to their own speech service; Firefox has no support, so callers
// must treat recognition as optional.

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}

interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
}

interface BrowserRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => BrowserRecognition;

function getConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getConstructor() !== null;
}

export interface Transcriber {
  stop(): void;
}

// Streams what the learner says; onText receives the full transcript so far (final + interim).
export function startTranscriber(onText: (text: string) => void, onError: (error: string) => void): Transcriber | null {
  const Recognition = getConstructor();
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  let finalText = "";
  let isStopped = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) finalText += `${result[0].transcript} `;
      else interim += result[0].transcript;
    }
    onText(`${finalText}${interim}`.trim());
  };
  recognition.onerror = (event) => {
    // "no-speech" and "aborted" are normal when the learner stops quickly; anything else (no permission,
    // mic busy, no network) is final, so stop instead of restarting in a loop.
    if (event.error === "no-speech" || event.error === "aborted") return;
    isStopped = true;
    onError(event.error);
  };
  // Some browsers end continuous recognition after a pause; restart until the learner presses Stop.
  recognition.onend = () => {
    if (!isStopped) {
      try {
        recognition.start();
      } catch {
        // Already restarting.
      }
    }
  };

  try {
    recognition.start();
  } catch {
    return null;
  }
  return {
    stop() {
      isStopped = true;
      recognition.stop();
    },
  };
}
