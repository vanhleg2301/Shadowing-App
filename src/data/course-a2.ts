// The A2 course ("Understand A2 English") and its Gentle plan. Week 1 is hand-picked here: five video days, then
// a review day and a free day; later weeks are built from the collection (src/data/course-weeks.ts).
// Each video day studies the words and sentences of its own video, so nothing here needs a paid service.

import type { CollectionId } from "./collections";

export const COURSE_ID = "speak-a2-7";

// English Sponge keeps the original id so earlier progress still counts; other collections get their own.
export function getCourseId(collection: CollectionId): string {
  return collection === "sponge" ? COURSE_ID : `${COURSE_ID}:${collection}`;
}

export type BlockKind = "review" | "words" | "listen" | "readalong" | "phrases" | "shadow" | "speak" | "quiz" | "extra" | "free";

export interface CourseBlock {
  id: string;
  kind: BlockKind;
  title: string;
  minutes: number;
  isOptional?: boolean;
  videoId?: string;
}

export interface CoursePhrase {
  text: string;
  meaning: string;
  example: string;
}

export interface CourseDay {
  // Counted across weeks: day 8 is the first day of week 2.
  day: number;
  // Five video days a week, then a day to hear the week's videos again and a free listening day.
  kind?: "study" | "review" | "free";
  title: string;
  canDo: string;
  // A video day's main video comes first, then one on the same topic and an optional bonus; a review day lists
  // the week's main videos.
  videos: { id: string; title: string }[];
  phrases: CoursePhrase[];
  // Questions to answer out loud (recorded on the device, never uploaded).
  speakingPrompts: string[];
}

export const COURSE_DAYS: CourseDay[] = [
  {
    day: 1,
    title: "Introduce yourself",
    canDo: "I can talk about myself, my family and what I do for 1 minute.",
    videos: [
      { id: "4SLlF4clbYI", title: "Talking About Family" },
      { id: "VjVFUs5y3WQ", title: "Getting to Know You!" },
      { id: "d-Q5ua6czFs", title: "The Birthday Surprise" },
    ],
    phrases: [
      { text: "Nice to meet you", meaning: "a polite thing to say when you meet someone new", example: "Hi, I'm Anna. Nice to meet you." },
      { text: "I'm from", meaning: "say the place where you were born or live", example: "I'm from Hanoi, in the north of Vietnam." },
      { text: "I work as a", meaning: "say what your job is", example: "I work as a teacher in a small school." },
      { text: "I live with", meaning: "say who shares your home", example: "I live with my parents and my sister." },
      { text: "In my free time, I", meaning: "talk about your hobbies", example: "In my free time, I play football." },
      { text: "I'm really into", meaning: "say something you like a lot", example: "I'm really into cooking at the moment." },
      { text: "What do you do?", meaning: "ask about someone's job", example: "So, what do you do?" },
      { text: "How about you?", meaning: "ask the same question back", example: "I love coffee. How about you?" },
      { text: "I have two brothers", meaning: "talk about your brothers and sisters", example: "I have two brothers and no sisters." },
      { text: "We get on well", meaning: "we have a friendly relationship", example: "My sister and I get on well." },
      { text: "I've been learning English for", meaning: "say how long you have studied", example: "I've been learning English for three years." },
      { text: "Sorry, could you say that again?", meaning: "ask someone to repeat", example: "Sorry, could you say that again, please?" },
      { text: "What does that mean?", meaning: "ask about a word you don't know", example: "Grit? What does that mean?" },
      { text: "It was nice talking to you", meaning: "a friendly way to end a chat", example: "I have to go now. It was nice talking to you." },
      { text: "See you soon", meaning: "goodbye, when you will meet again", example: "Thanks for today. See you soon!" },
    ],
    speakingPrompts: [
      "Introduce yourself in 30 seconds: name, where you are from, and what you do.",
      "Tell me about your family. Who do you live with?",
      "What do you like doing in your free time? Why?",
      "Why are you learning English?",
      "Someone says something you don't understand. What do you say?",
    ],
  },
  {
    day: 2,
    title: "Your day and your week",
    canDo: "I can describe my daily routine, what I did yesterday and my plans.",
    videos: [
      { id: "BTo8wSy_QCI", title: "What I Did Yesterday" },
      { id: "gpxky5lT7jA", title: "Getting Ready For Bed" },
      { id: "FEs2WL3SUGk", title: "Talking About The Future" },
    ],
    phrases: [
      { text: "I usually get up at", meaning: "say what time you wake up on most days", example: "I usually get up at six thirty." },
      { text: "First, I", meaning: "start describing steps in order", example: "First, I have a shower." },
      { text: "After that,", meaning: "the next thing that happens", example: "After that, I have breakfast." },
      { text: "On weekdays", meaning: "Monday to Friday", example: "On weekdays, I work from nine to five." },
      { text: "At the weekend", meaning: "on Saturday and Sunday", example: "At the weekend, I visit my grandma." },
      { text: "Yesterday, I went to", meaning: "talk about a place you visited yesterday", example: "Yesterday, I went to the market." },
      { text: "I didn't have time to", meaning: "you wanted to do something but were too busy", example: "I didn't have time to cook, so I ate out." },
      { text: "It took me about", meaning: "say how long something lasted", example: "It took me about an hour to get home." },
      { text: "I'm going to", meaning: "talk about a plan", example: "I'm going to visit my friend tomorrow." },
      { text: "I'm thinking of", meaning: "a plan you are not sure about yet", example: "I'm thinking of joining a gym." },
      { text: "Most of the time", meaning: "usually, almost always", example: "Most of the time, I take the bus." },
      { text: "Once a week", meaning: "one time every week", example: "I go swimming once a week." },
      { text: "I'm a morning person", meaning: "you have more energy early in the day", example: "I'm a morning person, so I study before work." },
      { text: "I'm exhausted", meaning: "very, very tired", example: "I worked all day. I'm exhausted." },
      { text: "What are you up to this weekend?", meaning: "ask about someone's weekend plans", example: "Hey, what are you up to this weekend?" },
    ],
    speakingPrompts: [
      "Describe a normal weekday for you, from morning to night. Use first, then, after that.",
      "What did you do yesterday? Say at least five things.",
      "What are you going to do this weekend?",
      "How often do you exercise, cook or read? Use once a week, twice a week...",
      "Ask me about my weekend plans, then answer the question yourself.",
    ],
  },
  {
    day: 3,
    title: "Ordering food and drinks",
    canDo: "I can order in a café or restaurant, ask questions and pay.",
    videos: [
      { id: "oiNjevJGadM", title: "Going to the Cafe!" },
      { id: "t0CzY96Bsl0", title: "A Typical English Cafe!" },
      { id: "ApEKUU5OT4w", title: "Everybody Loves Pizza" },
    ],
    phrases: [
      { text: "Could I have", meaning: "a polite way to ask for something", example: "Could I have a cappuccino, please?" },
      { text: "I'd like", meaning: "a polite way to say what you want", example: "I'd like the chicken salad, please." },
      { text: "For here or to go?", meaning: "will you eat in the café or take it away?", example: "For here or to go? — To go, please." },
      { text: "What do you recommend?", meaning: "ask the staff for their best choice", example: "It all looks good. What do you recommend?" },
      { text: "Does it come with", meaning: "ask what is included", example: "Does it come with chips?" },
      { text: "Can I get it without", meaning: "ask to remove something", example: "Can I get it without onions?" },
      { text: "A table for two, please", meaning: "ask for a table for two people", example: "Hi, a table for two, please." },
      { text: "Is this seat taken?", meaning: "ask if you can sit there", example: "Excuse me, is this seat taken?" },
      { text: "Could we have the bill, please?", meaning: "ask to pay at the end of a meal", example: "That was lovely. Could we have the bill, please?" },
      { text: "Can I pay by card?", meaning: "ask if they take bank cards", example: "Can I pay by card, or cash only?" },
      { text: "I'm allergic to", meaning: "a food makes you ill", example: "I'm allergic to nuts." },
      { text: "That's all, thanks", meaning: "you don't want anything else", example: "Anything else? — No, that's all, thanks." },
      { text: "It's on me", meaning: "I will pay for everyone", example: "Put your money away. It's on me." },
      { text: "Let's split the bill", meaning: "everyone pays their part", example: "Let's split the bill, OK?" },
      { text: "Excuse me, I ordered", meaning: "say politely there is a mistake", example: "Excuse me, I ordered a latte, not a mocha." },
    ],
    speakingPrompts: [
      "You are in a café. Order a drink and something to eat.",
      "Ask the waiter what they recommend, then choose.",
      "Your food has onions but you can't eat them. What do you say?",
      "Ask for the bill and ask if you can pay by card.",
      "Describe your favourite place to eat and what you usually order.",
    ],
  },
  {
    day: 4,
    title: "Shopping and services",
    canDo: "I can buy things, ask about price and size, and book a simple service.",
    videos: [
      { id: "yfoMWzJjGGg", title: "Food Shopping at the Supermarket!" },
      { id: "4EnHaDLE-cc", title: "Getting A Haircut!" },
      { id: "0aX-xbTLBxo", title: "Buying a T-Shirt" },
    ],
    phrases: [
      { text: "How much is this?", meaning: "ask the price", example: "Excuse me, how much is this jacket?" },
      { text: "Do you have this in", meaning: "ask for another size or colour", example: "Do you have this in a medium?" },
      { text: "Can I try it on?", meaning: "ask to wear clothes before buying", example: "I like this shirt. Can I try it on?" },
      { text: "Where are the changing rooms?", meaning: "ask where to try clothes", example: "Sorry, where are the changing rooms?" },
      { text: "It's a bit too", meaning: "say there is a small problem", example: "It's a bit too big for me." },
      { text: "I'm just looking, thanks", meaning: "you don't need help yet", example: "Can I help you? — I'm just looking, thanks." },
      { text: "I'll take it", meaning: "I will buy it", example: "OK, it fits well. I'll take it." },
      { text: "Is there a discount?", meaning: "ask if the price can be lower", example: "Is there a discount if I buy two?" },
      { text: "Can I get a refund?", meaning: "ask for your money back", example: "This doesn't work. Can I get a refund?" },
      { text: "Where can I find", meaning: "ask where something is in a shop", example: "Where can I find the milk?" },
      { text: "I'd like to book", meaning: "ask to reserve a time or service", example: "I'd like to book a haircut for Saturday." },
      { text: "Is there anything available", meaning: "ask if there is a free time", example: "Is there anything available this afternoon?" },
      { text: "Just a little shorter, please", meaning: "a small change at the hairdresser", example: "Just a little shorter on the sides, please." },
      { text: "Do I need a receipt?", meaning: "ask about the paper that shows you paid", example: "If I want to return it, do I need a receipt?" },
      { text: "That's a good deal", meaning: "a good price", example: "Two for ten pounds? That's a good deal." },
    ],
    speakingPrompts: [
      "You want a T-shirt in another size and colour. Talk to the shop assistant.",
      "The shoes you bought are broken. Ask for a refund or exchange.",
      "Call a hairdresser and book an appointment for this week.",
      "Describe the last thing you bought. Where, how much, and why?",
      "A shop assistant asks if you need help, but you don't. What do you say?",
    ],
  },
  {
    day: 5,
    title: "Getting around",
    canDo: "I can ask for and give directions and use taxis, trains and buses.",
    videos: [
      { id: "SefOJ2iEcUM", title: "Asking for Directions" },
      { id: "nfIMJbm_obw", title: "Taking A Taxi!" },
      { id: "I5LtS-u21ag", title: "Taking The Train!" },
    ],
    phrases: [
      { text: "Excuse me, how do I get to", meaning: "ask the way to a place", example: "Excuse me, how do I get to the station?" },
      { text: "Is it far from here?", meaning: "ask about the distance", example: "The museum? Is it far from here?" },
      { text: "Go straight on", meaning: "keep walking in the same direction", example: "Go straight on for two minutes." },
      { text: "Turn left at the", meaning: "change direction at a place", example: "Turn left at the traffic lights." },
      { text: "It's on your right", meaning: "you will see it on the right side", example: "The bank is on your right." },
      { text: "It's about a ten-minute walk", meaning: "you can walk there in ten minutes", example: "It's about a ten-minute walk from here." },
      { text: "Could you take me to", meaning: "tell a taxi driver where to go", example: "Could you take me to this address, please?" },
      { text: "How long does it take?", meaning: "ask about travel time", example: "How long does it take to the airport?" },
      { text: "A return ticket to", meaning: "a ticket there and back", example: "A return ticket to Oxford, please." },
      { text: "Which platform is it?", meaning: "ask where the train leaves from", example: "The 10:15 to London. Which platform is it?" },
      { text: "Does this bus go to", meaning: "check the bus route", example: "Does this bus go to the city centre?" },
      { text: "I'm lost", meaning: "you don't know where you are", example: "Sorry, I'm lost. Where is King Street?" },
      { text: "Could you show me on the map?", meaning: "ask someone to point to a place", example: "Could you show me on the map, please?" },
      { text: "Can you drop me off here?", meaning: "ask the driver to stop", example: "Can you drop me off here, please?" },
      { text: "Keep the change", meaning: "the driver can keep the extra money", example: "Here's twenty. Keep the change." },
    ],
    speakingPrompts: [
      "A tourist asks you how to get from your home to the nearest supermarket. Explain.",
      "Get in a taxi: say where you want to go and ask how long it takes.",
      "Buy a train ticket: return or single, time and platform.",
      "You are lost in a new city. Ask a stranger for help.",
      "How do you usually travel to work or school? Describe the journey.",
    ],
  },
];

// Blocks are generated from the day's videos so every day has the same rhythm. The words, sentences and quiz come
// from the main video's transcript; the hand-written phrases are only used when it has none stored.
// Collections without their own picks use the English Sponge videos.
const COLLECTION_DAY_VIDEOS: Partial<Record<Exclude<CollectionId, "sponge">, Record<number, CourseDay["videos"]>>> = {
  voa: {
    1: [
      { id: "voa-3113733", title: "Hello, I'm Anna!" },
      { id: "voa-3355849", title: "Where Are You From?" },
      { id: "voa-3301733", title: "Meet My Family" },
    ],
    2: [
      { id: "voa-3355785", title: "Are You Free on Friday?" },
      { id: "voa-3406732", title: "Can You Come to the Party?" },
      { id: "voa-3357748", title: "She Always Does That" },
    ],
    3: [
      { id: "voa-3413753", title: "What Do You Want?" },
      { id: "voa-3723588", title: "May I Borrow That?" },
      { id: "voa-3522798", title: "Rolling on the River" },
    ],
    4: [
      { id: "voa-3323771", title: "How About This?" },
      { id: "voa-3571922", title: "Let's Make Dinner!" },
      { id: "voa-3737352", title: "How Can I Help?" },
    ],
    5: [
      { id: "voa-3225958", title: "Where Is the Gym?" },
      { id: "voa-3285228", title: "Come Over to My Place" },
      { id: "voa-3293986", title: "This Is My Neighborhood" },
    ],
  },
  "super-easy": {
    1: [
      { id: "W7mkL-Oz8nI", title: "How Native Speakers Greet Each Other" },
      { id: "dCOHe0PNXLA", title: "Questions About Greetings" },
      { id: "bzQyR5RJzT8", title: "At the University" },
    ],
    2: [
      { id: "QdBrS0MQJbg", title: "A Dog's Daily Routine" },
      { id: "BRdTUrxiXKs", title: "Things and Rooms in a House" },
      { id: "gK_fJhxeDpE", title: "What's in a Canadian Garage?" },
    ],
    3: [
      { id: "LLLJwE6vr2k", title: "A Restaurant Conversation" },
      { id: "zvYLQdLoYjw", title: "Simple Words to Describe Food" },
      { id: "_T0yxFHtdpA", title: "More Words to Describe Food" },
    ],
    4: [
      { id: "3LoDWINL9Rw", title: "Common Clothing Words" },
      { id: "fxcOpbzUK4Q", title: "At the Mall" },
      { id: "9iLcj6kfn_0", title: "50 Words and Their Opposites" },
    ],
    5: [
      { id: "q9qbH6rw9lg", title: "Essential Car Words" },
      { id: "PiU-AJ0IaT0", title: "On the Streets of Cologne" },
      { id: "92ozftd0RzU", title: "At the Central Library" },
    ],
  },
  "easy-street": {
    1: [
      { id: "TwBYlBjbokU", title: "Everyday Conversations With Strangers" },
      { id: "rPgykzyHg6I", title: "Small Talk Advice" },
      { id: "-WB_SGqeJo8", title: "What Do You Do for a Living?" },
    ],
    2: [
      { id: "yUdhPFXRFmM", title: "What Are Your Plans Today?" },
      { id: "0cPmzcW5l1I", title: "What Are Your Plans Today? (Part 2)" },
      { id: "JjEJQzRQFa0", title: "Conversations in the Past, Present and Future" },
    ],
    3: [
      { id: "Y48ATz0pGT8", title: "What Do Brits Eat for Breakfast?" },
      { id: "7WvW2KZm8S0", title: "Favourite Food" },
      { id: "nvhcPK_IsIQ", title: "Why Do British People Love the Pub?" },
    ],
    4: [
      { id: "b7WcAmzNZ88", title: "Everyday Conversations for Shopping" },
      { id: "yl--RTTtKLs", title: "Conversations for Shopping" },
      { id: "mgYE-v02kds", title: "Real Phone Conversations" },
    ],
    5: [
      { id: "S3gaSvXqLH0", title: "Advice for Travelling by Train" },
      { id: "v8ecvyglvJ8", title: "Conversations for Tourists" },
      { id: "HU9wGpwUa4U", title: "Conversations and Words for Tourists" },
    ],
  },
  bob: {
    1: [
      { id: "ovl9kM46r10", title: "How to Describe Yourself" },
      { id: "amxeGGNwwzE", title: "English Greetings" },
      { id: "2PHMBn4QeQo", title: "How to Describe Yourself, Part 2" },
    ],
    2: [
      { id: "ecF1y2bI2T4", title: "How to Talk About Your Daily Routine" },
      { id: "t78zZyF3Pq4", title: "Your Daily Routine, Part 2" },
      { id: "yW-YeEc_ULg", title: "How to Describe a Day Off" },
    ],
    3: [
      { id: "uUMPULuwdLI", title: "How to Order Food at a Restaurant" },
      { id: "fx4Db7QD8yU", title: "English You Will Hear at a Restaurant" },
      { id: "IINRthI72-A", title: "How to Order and Describe Food" },
    ],
    4: [
      { id: "HQUW4T0w2zY", title: "At the Shopping Mall" },
      { id: "DYpqs413zB8", title: "Money Phrases" },
      { id: "Do9ikN_NqtE", title: "Clothing and How People Dress" },
    ],
    5: [
      { id: "_UwT0tC5JTk", title: "Describing Location and Motion" },
      { id: "SmSRH7kpdYA", title: "How to Describe Places" },
      { id: "KLnH1HHzaho", title: "Talking About Towns and Cities" },
    ],
  },
  bbc: {
    1: [
      { id: "I_tRSrPru94", title: "How to Introduce Yourself" },
      { id: "31y2Bq1RYQA", title: "Saying Where You're From" },
      { id: "v9EU41cuhHY", title: "How to Describe Your Family" },
    ],
    2: [
      { id: "bq6GBbh3uhU", title: "How to Talk About Your Daily Routine" },
      { id: "sJ7sRSK2in4", title: "Talking About Routines" },
      { id: "kTf0V4HyFtM", title: "What You Did Last Weekend" },
    ],
    3: [
      { id: "bVRIpmjTSxM", title: "Talking About Restaurants" },
      { id: "4C4wlOAscvY", title: "Talking About Food" },
      { id: "BFJsSnEEGrI", title: "How Do You Take Your Coffee?" },
    ],
    4: [
      { id: "2mnL9jPVzsk", title: "Clothes Shopping" },
      { id: "E3G-dsvZHGU", title: "When Is It OK to Complain?" },
      { id: "n0rrgJ4MGdY", title: "A Conversation About Hair" },
    ],
    5: [
      { id: "SHXPpsIJTb0", title: "Asking for and Giving Directions" },
      { id: "Fxi4uYmCrPo", title: "Talking About Public Transport" },
      { id: "JgB6-RWnV9M", title: "Talking About Travel" },
    ],
  },
};

// Week 1 has hand-picked videos for some collections; later weeks are built for one collection already.
export function getDayVideos(day: CourseDay, collection: CollectionId): CourseDay["videos"] {
  return collection === "sponge" || day.day > 7 ? day.videos : (COLLECTION_DAY_VIDEOS[collection]?.[day.day] ?? day.videos);
}

// The last two days of every week: hear the week's videos again, then listen to anything for pleasure.
export function getRestDayBlocks(day: CourseDay): CourseBlock[] {
  if (day.kind === "review") {
    return [
      ...day.videos.map((video, i) => ({
        id: `again-${i + 1}`,
        kind: "listen" as const,
        title: `Hear it again, text hidden: ${video.title}`,
        minutes: 10,
        videoId: video.id,
      })),
      { id: "review", kind: "review", title: "Review the words you saved", minutes: 10, isOptional: true },
    ];
  }
  return [
    { id: "free", kind: "free", title: "Listen to anything you enjoy for 20–30 minutes", minutes: 25 },
    { id: "stories", kind: "free", title: "Or read today's story", minutes: 10, isOptional: true },
  ];
}

// Comprehensible input: the day is one main video, made understandable first with its own words and heard three
// times, about an hour in all. A second video on the same topic and speaking come after, if there is time.
export function getBlocks(day: CourseDay, collection: CollectionId = "sponge"): CourseBlock[] {
  if (day.kind === "review" || day.kind === "free") return getRestDayBlocks(day);
  const [main, second, extra] = getDayVideos(day, collection);
  return [
    ...(day.day > 1 ? [{ id: "review", kind: "review" as const, title: "Warm up: yesterday's sentences, by ear", minutes: 5 }] : []),
    { id: "words", kind: "words", title: "Before you listen: words from the video", minutes: 10 },
    { id: "listen-1", kind: "listen", title: `Listen 1, text hidden: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "readalong-1", kind: "readalong", title: `Listen 2, with the text: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "phrases", kind: "phrases", title: "Sentences from the video", minutes: 10 },
    { id: "shadow-1", kind: "shadow", title: `Shadow: ${main.title}`, minutes: 15, videoId: main.id },
    { id: "quiz", kind: "quiz", title: "Quiz: fill the gaps in the video's sentences", minutes: 5 },
    { id: "relisten-1", kind: "readalong", title: `Listen 3, straight through: ${main.title}`, minutes: 10, videoId: main.id },
    ...(second ? [{ id: "listen-2", kind: "listen" as const, title: `Same topic, text hidden: ${second.title}`, minutes: 15, videoId: second.id, isOptional: true }] : []),
    { id: "speak", kind: "speak", title: "Speak: retell the video in your own words", minutes: 10, isOptional: true },
    ...(extra ? [{ id: "extra", kind: "extra" as const, title: `Bonus listening: ${extra.title}`, minutes: 15, videoId: extra.id, isOptional: true }] : []),
  ];
}

export function getCourseDay(dayNumber: number): CourseDay | undefined {
  return COURSE_DAYS.find((d) => d.day === dayNumber);
}

// "Gentle" plan for A1 learners moving up to A2: the same days with fewer, shorter steps (about 60–75 minutes)
// and slower playback. Block ids match the full plan, so progress carries over.
export const GENTLE_PHRASE_COUNT = 8;
export const GENTLE_PROMPT_COUNT = 3;
export const GENTLE_PLAYBACK_RATE = 0.75;

export function getGentleBlocks(day: CourseDay, collection: CollectionId = "sponge"): CourseBlock[] {
  if (day.kind === "review" || day.kind === "free") return getRestDayBlocks(day);
  const [main, second] = getDayVideos(day, collection);
  return [
    ...(day.day > 1 ? [{ id: "review", kind: "review" as const, title: "Warm up: yesterday's sentences, by ear", minutes: 5 }] : []),
    { id: "words", kind: "words", title: `Before you listen: ${GENTLE_PHRASE_COUNT} words from the video`, minutes: 10 },
    { id: "listen-1", kind: "listen", title: `Listen 1, text hidden: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "readalong-1", kind: "readalong", title: `Listen 2, with the text: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "phrases", kind: "phrases", title: `${GENTLE_PHRASE_COUNT} sentences from the video`, minutes: 10 },
    { id: "shadow-1", kind: "shadow", title: `Shadow slowly: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "quiz", kind: "quiz", title: "Quiz: fill the gaps", minutes: 5 },
    { id: "relisten-1", kind: "readalong", title: `Listen 3, straight through: ${main.title}`, minutes: 10, videoId: main.id, isOptional: true },
    { id: "speak", kind: "speak", title: `Speak: ${GENTLE_PROMPT_COUNT} short answers, copy the video first`, minutes: 10, isOptional: true },
    ...(second ? [{ id: "extra", kind: "extra" as const, title: `Bonus listening: ${second.title}`, minutes: 15, videoId: second.id, isOptional: true }] : []),
  ];
}
