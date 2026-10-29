// Everyday-English videos from the English Sponge channel (A1, A2 and B1 "Comprehensible Input" playlists),
// grouped by daily-life topic. Entertainment episodes (anime, games, films) are left out.
// The live catalog is the videos table (managed in /admin/videos); this list seeded it and is the fallback.
import type { CollectionId } from "./collections";

export const LEVELS = ["A1", "A2", "B1"] as const;

export type Level = (typeof LEVELS)[number];

export const TOPICS = [
  "Everyday Words",
  "Home & Routine",
  "Food & Drink",
  "Shopping & Services",
  "Getting Around",
  "Health",
  "Family & Friends",
  "Free Time",
  "Weather & Outdoors",
  "Talking About Yourself",
  "Work",
  "Travel",
] as const;

// Admins can create topics beyond TOPICS, which only fixes the display order of the known ones.
export type Topic = string;

// Known topics first in their fixed order, then any topic an admin added, alphabetically.
export function orderTopics(topics: string[]): string[] {
  const known: readonly string[] = TOPICS;
  const unique = [...new Set(topics)];
  return [...known.filter((t) => unique.includes(t)), ...unique.filter((t) => !known.includes(t)).sort()];
}

export interface CuratedVideo {
  videoId: string;
  title: string;
  level: Level;
  topic: Topic;
  duration: string;
  channel?: string;
  // Missing means English Sponge, the original collection.
  collection?: CollectionId;
  // false when the transcript isn't stored yet: the video opens in listen-and-note mode.
  hasTranscript?: boolean;
  // News lessons (VOA As It Is and similar) only: shown in the News tab, newest first.
  category?: string;
  publishedAt?: string;
}

export const CHANNEL_NAME = "English Sponge";

export const CURATED_VIDEOS: CuratedVideo[] = [
  { videoId: "0SeZFnmLvW4", title: "Basic Vocabulary 1", level: "A1", topic: "Everyday Words", duration: "7:30" },
  { videoId: "Zkq_2sQE7vU", title: "Basic Vocabulary 2", level: "A1", topic: "Everyday Words", duration: "7:10" },
  { videoId: "JwKe4AnTc0U", title: "Easy Listening for Beginners", level: "A1", topic: "Everyday Words", duration: "9:21" },
  { videoId: "0wWsK5Af1-M", title: "Basic Vocabulary 3", level: "A1", topic: "Everyday Words", duration: "7:53" },
  { videoId: "tob3McH5j00", title: "Basic Vocabulary 4", level: "A1", topic: "Everyday Words", duration: "10:15" },
  { videoId: "1gDrKihh2Wc", title: "Basic Vocabulary 5", level: "A1", topic: "Everyday Words", duration: "6:41" },
  { videoId: "-Hc8xbXv9mQ", title: "Basic Vocabulary 6", level: "A1", topic: "Everyday Words", duration: "9:38" },
  { videoId: "r2RAQlm211E", title: "Basic Vocabulary 7", level: "A1", topic: "Everyday Words", duration: "10:02" },
  { videoId: "c3Udoie3GhM", title: "A Short Story 1", level: "A1", topic: "Everyday Words", duration: "7:51" },
  { videoId: "YH_HMMZb3sc", title: "A Short Story 2", level: "A1", topic: "Everyday Words", duration: "6:12" },
  { videoId: "ElBIlPC6qDA", title: "A Short Story 3", level: "A1", topic: "Everyday Words", duration: "7:21" },
  { videoId: "0lKSEkH8CJo", title: "A Short Story 4", level: "A1", topic: "Everyday Words", duration: "8:35" },
  { videoId: "QQK7rgM3Mhk", title: "5 Minutes Of Slow British English", level: "A2", topic: "Everyday Words", duration: "6:15" },
  { videoId: "LqSJ09k7wdA", title: "An Easy Video", level: "A2", topic: "Everyday Words", duration: "7:54" },
  { videoId: "yKKTJZuSvkI", title: "An Easy Walk", level: "A2", topic: "Everyday Words", duration: "11:39" },
  { videoId: "aIs3Zuf5Nnw", title: "Improve Your English Vocabulary with This Short Story", level: "B1", topic: "Everyday Words", duration: "9:08" },
  { videoId: "KEwsPvriZXA", title: "Practise Your English Listening with This Short Story", level: "B1", topic: "Everyday Words", duration: "10:03" },
  { videoId: "ivdWd_B0YBc", title: "The Hardworking Athlete!", level: "B1", topic: "Everyday Words", duration: "12:38" },
  { videoId: "FxnNckgUVVQ", title: "Random Objects!", level: "B1", topic: "Everyday Words", duration: "6:52" },
  { videoId: "_ur2qY28Rkk", title: "A Bad Day!", level: "B1", topic: "Everyday Words", duration: "6:49" },
  { videoId: "Ot86aiQ25j8", title: "Learn With Pictures", level: "B1", topic: "Everyday Words", duration: "9:02" },
  { videoId: "rE3CgxyqP-I", title: "Books, Daytime, Nighttime", level: "A1", topic: "Home & Routine", duration: "9:20" },
  { videoId: "N9Xz9y76C9s", title: "Tom Loses His Phone!", level: "A1", topic: "Home & Routine", duration: "7:10" },
  { videoId: "Z7p5dNEA8os", title: "Tom Cleans His Room", level: "A1", topic: "Home & Routine", duration: "7:24" },
  { videoId: "LkxTK225zFw", title: "Tom Waters His Flower", level: "A1", topic: "Home & Routine", duration: "5:09" },
  { videoId: "5qTrpUWC0To", title: "The Bedroom", level: "A1", topic: "Home & Routine", duration: "8:21" },
  { videoId: "WMbq1j4OLkA", title: "Talking About Time", level: "A1", topic: "Home & Routine", duration: "12:59" },
  { videoId: "gpxky5lT7jA", title: "Getting Ready For Bed", level: "A2", topic: "Home & Routine", duration: "11:13" },
  { videoId: "oamrW3S7YSo", title: "5 Foods I Like", level: "A1", topic: "Food & Drink", duration: "6:25" },
  { videoId: "g-Xi6JRj79Y", title: "Kitchen Vocabulary 1", level: "A1", topic: "Food & Drink", duration: "6:21" },
  { videoId: "Ld2zUmvR7uQ", title: "The Cafe (Part 2)", level: "A1", topic: "Food & Drink", duration: "3:42" },
  { videoId: "RfhJAi7XLYg", title: "Kitchen Vocabulary 2", level: "A2", topic: "Food & Drink", duration: "12:34" },
  { videoId: "yfoMWzJjGGg", title: "Food Shopping at the Supermarket!", level: "A2", topic: "Food & Drink", duration: "9:26" },
  { videoId: "ApEKUU5OT4w", title: "Everybody Loves Pizza", level: "A2", topic: "Food & Drink", duration: "6:44" },
  { videoId: "t0CzY96Bsl0", title: "A Typical English Cafe!", level: "A2", topic: "Food & Drink", duration: "5:36" },
  { videoId: "oiNjevJGadM", title: "Going to the Cafe!", level: "A2", topic: "Food & Drink", duration: "6:09" },
  { videoId: "rPuBSls1N-k", title: "Making Shepherd's Pie", level: "B1", topic: "Food & Drink", duration: "7:44" },
  { videoId: "oxfglpjS5zU", title: "Making Pancakes!", level: "B1", topic: "Food & Drink", duration: "13:41" },
  { videoId: "DcGfFv4XfyI", title: "Cooking Vocabulary 1", level: "B1", topic: "Food & Drink", duration: "9:18" },
  { videoId: "Rawyx6z7jLg", title: "Cooking Vocabulary 2", level: "B1", topic: "Food & Drink", duration: "7:23" },
  { videoId: "lI_FU1pXXZY", title: "The Kitchen", level: "B1", topic: "Food & Drink", duration: "7:41" },
  { videoId: "4EnHaDLE-cc", title: "Getting A Haircut!", level: "A2", topic: "Shopping & Services", duration: "6:40" },
  { videoId: "78z0iCr7pRQ", title: "The Post Office!", level: "B1", topic: "Shopping & Services", duration: "8:52" },
  { videoId: "LM4YdIdr7TA", title: "Using The ATM!", level: "B1", topic: "Shopping & Services", duration: "7:36" },
  { videoId: "0aX-xbTLBxo", title: "Buying a T-Shirt", level: "B1", topic: "Shopping & Services", duration: "6:59" },
  { videoId: "m7oNv8b1004", title: "The Stolen Wallet!", level: "B1", topic: "Shopping & Services", duration: "15:08" },
  { videoId: "SefOJ2iEcUM", title: "Asking for Directions", level: "A1", topic: "Getting Around", duration: "13:28" },
  { videoId: "-2SYjttlv8I", title: "In the City!", level: "A2", topic: "Getting Around", duration: "11:24" },
  { videoId: "rw3jJEg6AxY", title: "Walking The Dog", level: "A2", topic: "Getting Around", duration: "11:39" },
  { videoId: "nfIMJbm_obw", title: "Taking A Taxi!", level: "A2", topic: "Getting Around", duration: "6:57" },
  { videoId: "I5LtS-u21ag", title: "Taking The Train!", level: "A2", topic: "Getting Around", duration: "7:05" },
  { videoId: "6dj1xAUQtvs", title: "In The City", level: "B1", topic: "Getting Around", duration: "12:45" },
  { videoId: "6nHIFgeJ6_I", title: "Airport Madness!", level: "B1", topic: "Getting Around", duration: "10:38" },
  { videoId: "C9ZNqVcmecw", title: "Walking The Dog!", level: "B1", topic: "Getting Around", duration: "6:31" },
  { videoId: "HmhPaPvW6Es", title: "Motorcycle Taxi!", level: "B1", topic: "Getting Around", duration: "7:43" },
  { videoId: "jcuCSkJLsys", title: "Taking the Bus!", level: "B1", topic: "Getting Around", duration: "9:03" },
  { videoId: "5GvpHDudNQg", title: "Driving Vocabulary with a Car Chase!", level: "B1", topic: "Getting Around", duration: "10:06" },
  { videoId: "LyPTotsg0qI", title: "Driving Vocabulary", level: "B1", topic: "Getting Around", duration: "9:46" },
  { videoId: "NRUnVNFxc4U", title: "At The Airport", level: "B1", topic: "Getting Around", duration: "10:57" },
  { videoId: "6wt6Rn15MC8", title: "The Evil Tuktuk Driver!", level: "B1", topic: "Getting Around", duration: "17:04" },
  { videoId: "ihW1LOWyoH0", title: "5 Phrasal Verbs for Driving", level: "B1", topic: "Getting Around", duration: "7:08" },
  { videoId: "QwyqiTMtKr8", title: "Tom Goes To The Doctor!", level: "A1", topic: "Health", duration: "6:32" },
  { videoId: "jvBkSC5PfRY", title: "My Body", level: "A1", topic: "Health", duration: "3:55" },
  { videoId: "1nvlkMAXBqQ", title: "This Is My Face", level: "A1", topic: "Health", duration: "9:10" },
  { videoId: "7tQMyLTcF_I", title: "Talking About Exercise", level: "A2", topic: "Health", duration: "8:06" },
  { videoId: "0BLczS0yqXg", title: "Getting A Cold!", level: "A2", topic: "Health", duration: "9:27" },
  { videoId: "zFNL8CMXhxw", title: "A Trip To The Vet!", level: "B1", topic: "Health", duration: "9:52" },
  { videoId: "nzczAahSZ4U", title: "A Cut Finger!", level: "B1", topic: "Health", duration: "7:39" },
  { videoId: "sx7dfEJ-IfU", title: "At The Dentist!", level: "B1", topic: "Health", duration: "7:26" },
  { videoId: "a431NufQKLo", title: "Going to the doctor!", level: "B1", topic: "Health", duration: "8:39" },
  { videoId: "1-Gwh_Wdprc", title: "A Scooter Accident!", level: "B1", topic: "Health", duration: "10:45" },
  { videoId: "fE6FV_TudAI", title: "Family Picnic!", level: "A1", topic: "Family & Friends", duration: "8:16" },
  { videoId: "cVy8yen4fNg", title: "Tom Goes to See His Grandma", level: "A1", topic: "Family & Friends", duration: "7:26" },
  { videoId: "d-Q5ua6czFs", title: "The Birthday Surprise", level: "A2", topic: "Family & Friends", duration: "10:00" },
  { videoId: "aX0K2fLmAM0", title: "All Together Now!", level: "A2", topic: "Family & Friends", duration: "9:52" },
  { videoId: "4SLlF4clbYI", title: "Talking About Family", level: "A2", topic: "Family & Friends", duration: "4:48" },
  { videoId: "Y7U1AjrZFdE", title: "Justine Hates Christmas!?", level: "B1", topic: "Family & Friends", duration: "6:20" },
  { videoId: "VjVFUs5y3WQ", title: "Getting to Know You!", level: "B1", topic: "Family & Friends", duration: "11:38" },
  { videoId: "ySTI0sTY_98", title: "Edgar and Christmas!", level: "B1", topic: "Family & Friends", duration: "8:44" },
  { videoId: "iysQEBpK9VM", title: "Beach day!", level: "A2", topic: "Free Time", duration: "9:21" },
  { videoId: "-XzbITWcY1I", title: "Karaoke Party!", level: "A2", topic: "Free Time", duration: "8:04" },
  { videoId: "swOiEEj77PM", title: "Skiing In Canada!", level: "B1", topic: "Free Time", duration: "18:18" },
  { videoId: "heo1dety208", title: "Camping In English!", level: "B1", topic: "Free Time", duration: "6:56" },
  { videoId: "4ap3Fa3HvqU", title: "Skiing Madness!", level: "B1", topic: "Free Time", duration: "6:42" },
  { videoId: "HXvtRbh1EQI", title: "Going To The Cinema!", level: "B1", topic: "Free Time", duration: "8:30" },
  { videoId: "Ixgw6u81P3g", title: "I'm Outside!", level: "A1", topic: "Weather & Outdoors", duration: "2:37" },
  { videoId: "FD1a6XqSdXo", title: "By The River", level: "A2", topic: "Weather & Outdoors", duration: "9:46" },
  { videoId: "9nqxW5Z0NFU", title: "In A London Park!", level: "A2", topic: "Weather & Outdoors", duration: "5:22" },
  { videoId: "R42ORh1QRhs", title: "A Walk In Canada!", level: "A2", topic: "Weather & Outdoors", duration: "7:51" },
  { videoId: "4igRJivBVHw", title: "Talking About Weather", level: "A2", topic: "Weather & Outdoors", duration: "4:58" },
  { videoId: "jeRe8DyyiCw", title: "A Walk Around Oxford", level: "A2", topic: "Weather & Outdoors", duration: "12:18" },
  { videoId: "6V_8shlEuvE", title: "A Hot Day!", level: "B1", topic: "Weather & Outdoors", duration: "10:48" },
  { videoId: "-BWjJV5GZb8", title: "The Classroom", level: "A1", topic: "Talking About Yourself", duration: "10:06" },
  { videoId: "vgpkSmgHUI8", title: "The Past Tense in a Story", level: "A2", topic: "Talking About Yourself", duration: "10:03" },
  { videoId: "BTo8wSy_QCI", title: "What I Did Yesterday (Past Simple Tense)", level: "A2", topic: "Talking About Yourself", duration: "5:25" },
  { videoId: "YvFY6j6SEhE", title: "First Day At School!", level: "A2", topic: "Talking About Yourself", duration: "14:41" },
  { videoId: "c3bBlePnCmA", title: "Comparatives", level: "A2", topic: "Talking About Yourself", duration: "13:30" },
  { videoId: "FEs2WL3SUGk", title: "Talking About The Future", level: "A2", topic: "Talking About Yourself", duration: "5:56" },
  { videoId: "1F1MUHYcAcc", title: "The Money Challenge (2nd Conditional)", level: "B1", topic: "Talking About Yourself", duration: "11:37" },
  { videoId: "ZF0ILCqt2Rc", title: "My Morocco Trip", level: "A2", topic: "Travel", duration: "10:55" },
  { videoId: "lX01A3gIgyo", title: "My South East Asia Trip", level: "A2", topic: "Travel", duration: "12:11" },
  { videoId: "u2wzYR5cozg", title: "My Crazy America Trip", level: "A2", topic: "Travel", duration: "12:49" },
  { videoId: "k78JLH9lJMg", title: "My New Zealand Trip", level: "A2", topic: "Travel", duration: "8:33" },
  { videoId: "Zctva_0dEu4", title: "Which Countries Have I Been to?", level: "A2", topic: "Travel", duration: "11:02" },
  { videoId: "gR6ztRLcC_0", title: "Bodega Bay!", level: "B1", topic: "Travel", duration: "14:10" },
  { videoId: "O22dppF1u6M", title: "St Ives!", level: "B1", topic: "Travel", duration: "15:38" },
  { videoId: "FnJbUckecb8", title: "Only 135 people Live In This Village!", level: "B1", topic: "Travel", duration: "16:53" },
  { videoId: "PNjU7u1jQBk", title: "In Winchester!", level: "B1", topic: "Travel", duration: "26:58" },
  { videoId: "qI4ZCFCMtvM", title: "In a Japanese Garden!", level: "B1", topic: "Travel", duration: "16:11" },
  { videoId: "CSUlObNL7kQ", title: "In A Small Village!", level: "B1", topic: "Travel", duration: "19:51" },
  { videoId: "TZnMbO3lyKs", title: "The Best View In London!?", level: "B1", topic: "Travel", duration: "27:43" },
  { videoId: "WveZYiAKIS8", title: "Only 1000 People Live In This Village!", level: "B1", topic: "Travel", duration: "19:56" },
  { videoId: "gjXasnsOXU4", title: "Camden Town!", level: "B1", topic: "Travel", duration: "15:21" },
  { videoId: "gaPdK8uFfqU", title: "In Chile! San Cristobal", level: "B1", topic: "Travel", duration: "15:09" },
  { videoId: "SGCAIOuWw9s", title: "Brick Lane!", level: "B1", topic: "Travel", duration: "14:24" },
  { videoId: "_kIZx1NLZUg", title: "In Wantage!", level: "B1", topic: "Travel", duration: "24:56" },
  { videoId: "zrwK9eDF9hg", title: "In Basingstoke!", level: "B1", topic: "Travel", duration: "22:05" },
  { videoId: "uuwPM1iCGEk", title: "In Henley!", level: "B1", topic: "Travel", duration: "23:02" },
  { videoId: "DMxnejD3v0I", title: "In Windsor With The Queen!", level: "B1", topic: "Travel", duration: "21:31" },
  { videoId: "_UBC-Hw7LWk", title: "In A Small Town!", level: "B1", topic: "Travel", duration: "21:31" },
  { videoId: "4bC4l_NkD5I", title: "Buenos Aires Tour!", level: "B1", topic: "Travel", duration: "18:25" },
  { videoId: "TMHrkfTT1kc", title: "My Trip to Madagascar! (Part 1)", level: "B1", topic: "Travel", duration: "12:40" },
  { videoId: "hGZLKZGzsuQ", title: "On Holiday!", level: "B1", topic: "Travel", duration: "8:32" },
];
