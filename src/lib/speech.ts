export type Accent = "uk" | "us";

const LANG: Record<Accent, string> = { uk: "en-GB", us: "en-US" };

// Best free voices first: Edge "Natural", Apple "Premium"/"Enhanced" (downloadable on iOS/macOS),
// Google voices in Chrome, then known good Apple defaults.
const VOICE_PREFERENCE = [/natural/i, /premium/i, /enhanced/i, /google/i, /samantha|daniel|serena|karen|moira/i];

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-") === lang);
  for (const pattern of VOICE_PREFERENCE) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return voices.find((v) => v.localService) ?? voices[0];
}

export function speak(text: string, accent: Accent, rate = 0.9, onEnd?: () => void) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG[accent];
  const voice = pickVoice(LANG[accent]);
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
