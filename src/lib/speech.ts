export type Accent = "uk" | "us";

const LANG: Record<Accent, string> = { uk: "en-GB", us: "en-US" };

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-") === lang);
  return voices.find((v) => /natural|google/i.test(v.name)) ?? voices[0];
}

export function speak(text: string, accent: Accent) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG[accent];
  const voice = pickVoice(LANG[accent]);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
