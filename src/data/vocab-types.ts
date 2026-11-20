export interface VocabPhrase {
  // The chunk to learn, as it is said.
  phrase: string;
  // In simple English, never translated.
  meaning: string;
  example: string;
  // What the picture shows (scripts/grammar-images), or the picture's path for the grammar units' words.
  picture: string;
  // When you would say it, or when you would hear it: "What would you say?" asks for the phrase.
  situation?: string;
  // "hear": what the other person says to you (the waiter, the doctor…). Missing means you say it.
  role?: "hear";
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface SpeakTask {
  situation: string;
  answer: string;
}

export interface VocabTopic {
  // Progress is stored per topic id (course day 1–60).
  id: number;
  slug: string;
  title: string;
  kind: "situation" | "words";
  canDo: string;
  phrases: VocabPhrase[];
  // A conversation that uses the phrases; the learner plays `you` and predicts their lines.
  dialogue?: { title: string; you: string; lines: DialogueLine[] };
  speak?: SpeakTask[];
  // The grammar unit that goes with the topic.
  grammarSlug?: string;
}
