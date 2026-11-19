// My plan: one short video studied in depth all week, plus extra listening and speaking.
// Each weekday has its own core steps (about an hour); "Listen more" and "Speak" are optional every day.

export type PlanTaskKey =
  | "first-listen"
  | "dictation"
  | "relisten"
  | "shadow"
  | "shadow-through"
  | "listen-check"
  | "retell"
  | "talk"
  | "review"
  | "listen-more"
  | "speak";

export type PlanTaskKind = "video" | "retell" | "talk" | "review" | "listen-more" | "speak";

export interface PlanTask {
  key: PlanTaskKey;
  kind: PlanTaskKind;
  title: string;
  detail: string;
  minutes: string;
  // Query for /watch/<id> when the step opens the week's video.
  query?: string;
  isOptional?: boolean;
}

export const PLAN_TASK_KEYS: readonly PlanTaskKey[] = [
  "first-listen",
  "dictation",
  "relisten",
  "shadow",
  "shadow-through",
  "listen-check",
  "retell",
  "talk",
  "review",
  "listen-more",
  "speak",
];

export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const RETELL: PlanTask = {
  key: "retell",
  kind: "retell",
  title: "Say it in your own words",
  detail: "Close the video. Tell what it was about, then say 2–3 sentences about your own life using the new phrases. Record yourself.",
  minutes: "15 min",
};
const REVIEW: PlanTask = { key: "review", kind: "review", title: "Review your words", detail: "Go through the flashcards that are due today.", minutes: "10 min" };
const RELISTEN: PlanTask = {
  key: "relisten",
  kind: "video",
  title: "Listen again, no text",
  detail: "Play the video once without the text. Notice what you understand now.",
  minutes: "10 min",
  query: "listen=1",
};
const SHADOW: PlanTask = {
  key: "shadow",
  kind: "video",
  title: "Shadow sentence by sentence",
  detail: "Listen to a sentence, say it the same way, record it and compare. Copy the rhythm, not just the words.",
  minutes: "25 min",
  query: "mode=shadow",
};

const EXTRAS: PlanTask[] = [
  {
    key: "listen-more",
    kind: "listen-more",
    title: "Listen more",
    detail: "Watch easy videos straight through. Don't stop and don't look words up: the goal is hours of listening.",
    minutes: "30–60 min",
    isOptional: true,
  },
  {
    key: "speak",
    kind: "speak",
    title: "Speak",
    detail: "Talk about today's topic for a few minutes, or practise with a real person.",
    minutes: "20–30 min",
    isOptional: true,
  },
];

const CORE_BY_WEEKDAY: PlanTask[][] = [
  // Monday: meet the video.
  [
    {
      key: "first-listen",
      kind: "video",
      title: "First listen, no text",
      detail: "Play the whole video without the text and guess what it is about.",
      minutes: "5 min",
      query: "listen=1",
    },
    {
      key: "dictation",
      kind: "video",
      title: "Dictation",
      detail: "Type the sentences you couldn't catch. Every mistake shows you a sound your ears still miss.",
      minutes: "20 min",
      query: "mode=dictation",
    },
    RETELL,
    REVIEW,
  ],
  [RELISTEN, SHADOW, RETELL, REVIEW],
  [RELISTEN, SHADOW, RETELL, REVIEW],
  [
    RELISTEN,
    {
      key: "shadow-through",
      kind: "video",
      title: "Shadow without stopping",
      detail: "Turn on Play through and speak along with the video as it plays.",
      minutes: "25 min",
      query: "mode=shadow",
    },
    RETELL,
    REVIEW,
  ],
  [
    {
      key: "listen-check",
      kind: "video",
      title: "Listen check",
      detail: "Play the video without the text. You should understand almost all of it now.",
      minutes: "10 min",
      query: "listen=1",
    },
    { ...SHADOW, title: "Shadow the hard parts", detail: "Go back to the sentences that are still hard and shadow them again.", minutes: "15 min" },
    { ...RETELL, title: "Retell the whole video", detail: "Close the video and tell the whole story in about 2 minutes. Record yourself." },
    REVIEW,
  ],
  // Saturday: the recording to compare with later weeks.
  [
    RELISTEN,
    {
      key: "talk",
      kind: "talk",
      title: "Your weekly recording",
      detail: "Talk for about 2 minutes about the video's topic and your own life. Save it to hear how far you've come in a few weeks.",
      minutes: "15 min",
    },
    REVIEW,
  ],
  // Sunday: rest.
  [REVIEW],
];

// 1 = Monday … 7 = Sunday.
export function getDayTasks(weekday: number): { core: PlanTask[]; extras: PlanTask[] } {
  return { core: CORE_BY_WEEKDAY[weekday - 1] ?? [], extras: EXTRAS };
}

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (date: Date) => date.toISOString().slice(0, 10);

export function addDays(day: string, count: number): string {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + count);
  return toDay(date);
}

// 1 = Monday … 7 = Sunday, for a calendar day (YYYY-MM-DD).
export function getWeekday(day: string): number {
  return ((toDate(day).getUTCDay() + 6) % 7) + 1;
}

export function getWeekStart(day: string): string {
  return addDays(day, 1 - getWeekday(day));
}

export function isDayDone(weekday: number, done: readonly string[] | undefined): boolean {
  const core = getDayTasks(weekday).core;
  return core.length > 0 && core.every((task) => done?.includes(task.key));
}

const SPEAK_TOPICS = [
  "Describe your morning today, step by step.",
  "Talk about a friend: how you met and what you do together.",
  "What did you eat yesterday? Where, and was it good?",
  "Describe your home or your room to someone who has never seen it.",
  "Talk about your job or studies: what you do on a normal day.",
  "Tell the story of a trip you remember well.",
  "What do you do to relax after a long day?",
  "Describe a problem you had recently and how you solved it.",
  "Talk about a film or video you enjoyed and why.",
  "What are your plans for the weekend?",
  "Describe your city: what's good about it, and what isn't.",
  "Talk about a skill you want to learn and why.",
  "Describe a typical family meal.",
  "What was the best thing that happened to you this week?",
  "Give directions from your home to a place you like.",
  "Talk about your phone: what you use it for every day.",
  "Describe the weather today and how it changes your plans.",
  "Talk about someone you admire.",
  "Order your favourite meal at a café, playing both people.",
  "Introduce yourself as if you were at a job interview.",
];

export function getSpeakTopic(day: string): string {
  const index = Math.floor(toDate(day).getTime() / 86_400_000);
  return SPEAK_TOPICS[index % SPEAK_TOPICS.length];
}
