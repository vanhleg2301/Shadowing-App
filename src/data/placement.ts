import type { Level } from "@/data/curated";

// A 3-minute check: listening (the app reads the sentence aloud) and everyday grammar/vocabulary,
// getting harder from A1 to B1. Hand-written, so it costs nothing to run.
export interface PlacementQuestion {
  level: Level;
  // When set, the sentence is read aloud and not shown.
  listen?: string;
  prompt: string;
  options: string[];
  answer: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  { level: "A1", prompt: "Hello! My name ___ Anna.", options: ["am", "is", "are", "be"], answer: "is" },
  { level: "A1", listen: "I have two sisters and one brother.", prompt: "How many brothers?", options: ["None", "One", "Two", "Three"], answer: "One" },
  { level: "A1", prompt: "I ___ coffee every morning.", options: ["drink", "drinks", "drinking", "am drink"], answer: "drink" },
  { level: "A1", prompt: "Where ___ you live?", options: ["is", "are", "do", "does"], answer: "do" },
  { level: "A2", prompt: "Yesterday we ___ to the beach.", options: ["go", "goes", "went", "gone"], answer: "went" },
  { level: "A2", listen: "Sorry, I can't come on Friday. How about Saturday morning?", prompt: "When does the speaker want to meet?", options: ["Friday morning", "Friday evening", "Saturday morning", "Sunday"], answer: "Saturday morning" },
  { level: "A2", prompt: "This bag is ___ than that one.", options: ["cheap", "cheaper", "cheapest", "more cheap"], answer: "cheaper" },
  { level: "A2", prompt: "Could I ___ the bill, please?", options: ["make", "have", "do", "take"], answer: "have" },
  { level: "B1", prompt: "I've lived here ___ 2019.", options: ["for", "since", "from", "during"], answer: "since" },
  { level: "B1", listen: "I was going to take the train, but it was cancelled, so I ended up driving.", prompt: "How did the speaker travel?", options: ["By train", "By car", "By bus", "On foot"], answer: "By car" },
  { level: "B1", prompt: "If it rains tomorrow, we ___ at home.", options: ["stay", "will stay", "would stay", "stayed"], answer: "will stay" },
  { level: "B1", prompt: "She asked me where I ___.", options: ["work", "am working", "worked", "do work"], answer: "worked" },
];

export const LEVEL_STORAGE_KEY = "placement-level";

// The level to study: the first one where fewer than 3 of its 4 questions were right.
export function getPlacementLevel(correctByLevel: Record<Level, number>): Level {
  if (correctByLevel.A1 < 3) return "A1";
  if (correctByLevel.A2 < 3) return "A2";
  return "B1";
}
