// Vocabulary: A2 phrases learned as whole chunks, through pictures and everyday situations. A situation topic
// teaches the phrases with pictures, asks what a picture shows, asks what you would say in a situation, puts the
// phrases in a short conversation and ends with saying them. The grammar units' words are topics too (pictures only).
// The pictures share the grammar units' cast, so the people stay familiar.
import { GRAMMAR_UNITS, getWordPicture } from "./grammar";

export interface VocabPhrase {
  // The chunk to learn, as it is said.
  phrase: string;
  // In simple English, never translated.
  meaning: string;
  example: string;
  // What the picture shows (scripts/grammar-images), or the picture's path for the grammar units' words.
  picture: string;
  // "What would you say?": when you would use the phrase.
  situation?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  // The phrase (its text without the final ? . or !) that is blanked out in this line.
  gap?: string;
}

export interface SpeakTask {
  situation: string;
  answer: string;
}

export interface VocabTopic {
  // Progress is stored per topic id.
  id: number;
  slug: string;
  title: string;
  kind: "situation" | "words";
  canDo: string;
  phrases: VocabPhrase[];
  dialogue?: { title: string; lines: DialogueLine[] };
  speak?: SpeakTask[];
  // The grammar unit that goes with the topic.
  grammarSlug?: string;
}

export const VOCAB_COURSE_ID = "vocab-a2";

const SITUATION_TOPICS: VocabTopic[] = [
  {
    id: 1,
    slug: "at-a-cafe",
    title: "At a café",
    kind: "situation",
    canDo: "I can order, ask for the bill and pay at a café.",
    grammarSlug: "can-could-have-to",
    phrases: [
      {
        phrase: "A table for two",
        meaning: "a place to sit for two people",
        example: "Hi, a table for two, please.",
        situation: "You arrive at a café with a friend and need somewhere to sit.",
        picture: "{Mai} and {Lan} at the door of a cosy café, {Mai} holding up two fingers to a smiling waiter.",
      },
      {
        phrase: "Can I see the menu?",
        meaning: "ask for the list of food and drinks",
        example: "Excuse me, can I see the menu?",
        situation: "You sit down, but you don't know what the café has.",
        picture: "{Ben} sitting at a café table, a waiter handing him a menu card.",
      },
      {
        phrase: "I'd like a latte",
        meaning: "a polite way to say what you want",
        example: "I'd like a latte, please.",
        situation: "The waiter asks what you want to drink. You want a latte.",
        picture: "A tall glass of latte with milk foam on a saucer on a wooden café table.",
      },
      {
        phrase: "For here",
        meaning: "to eat or drink in the café",
        example: "Is that for here or to take away? For here, please.",
        situation: "The waiter asks if you will stay. You want to sit and drink your tea in the café.",
        picture: "{Lan} sitting comfortably in a café armchair with a cup of tea, reading a book.",
      },
      {
        phrase: "To take away",
        meaning: "to eat or drink somewhere else",
        example: "One iced coffee to take away, please.",
        situation: "You want your coffee in a paper cup, to drink on the way to work.",
        picture: "{Nam} walking out of a café holding a paper cup of iced coffee with a lid and a straw.",
      },
      {
        phrase: "With no sugar",
        meaning: "without anything sweet in it",
        example: "A black coffee with no sugar, please.",
        situation: "You don't like sweet drinks. You want your coffee plain.",
        picture: "A cup of black coffee on a café table, a closed sugar bowl pushed to the side.",
      },
      {
        phrase: "Is this seat free?",
        meaning: "ask if you can sit in an empty chair",
        example: "Excuse me, is this seat free?",
        situation: "The café is busy. You see an empty chair next to someone.",
        picture: "{Ben} pointing politely at an empty chair next to a woman reading in a busy café.",
      },
      {
        phrase: "Can I have the bill?",
        meaning: "ask for the paper that shows how much to pay",
        example: "Excuse me, can I have the bill, please?",
        situation: "You finished your meal and want to pay.",
        picture: "{Hoa} raising her hand at a café table with empty plates, a waiter walking over with a small bill.",
      },
      {
        phrase: "Can I pay by card?",
        meaning: "ask if you can pay with your bank card",
        example: "I don't have any cash. Can I pay by card?",
        situation: "You have no cash, only your bank card.",
        picture: "{Mai} holding a bank card over a card machine at a café counter.",
      },
      {
        phrase: "Keep the change",
        meaning: "you don't want the extra money back",
        example: "Here's fifty thousand. Keep the change.",
        situation: "The bill is 45,000 dong. You give 50,000 and you don't want any money back.",
        picture: "{Nam} handing banknotes to a smiling waiter and waving his hand kindly, a few coins on the table.",
      },
    ],
    dialogue: {
      title: "Mai has a coffee",
      lines: [
        { speaker: "Waiter", text: "Hi! Is that for here or to take away?" },
        { speaker: "Mai", text: "For here, please.", gap: "For here" },
        { speaker: "Waiter", text: "Sure. What can I get you?" },
        { speaker: "Mai", text: "I'd like a latte, please.", gap: "I'd like a latte" },
        { speaker: "Waiter", text: "Anything to eat?" },
        { speaker: "Mai", text: "No, thanks. Oh, can I pay by card?", gap: "Can I pay by card" },
        { speaker: "Waiter", text: "Of course." },
        { speaker: "Mai", text: "Excuse me, can I have the bill?", gap: "Can I have the bill" },
        { speaker: "Waiter", text: "Here you are. That's forty-five thousand." },
        { speaker: "Mai", text: "Here's fifty. Keep the change.", gap: "Keep the change" },
      ],
    },
    speak: [
      { situation: "You and a friend walk into a busy café.", answer: "Hi, a table for two, please." },
      { situation: "You want an iced coffee to drink on the bus.", answer: "One iced coffee to take away, please." },
      { situation: "You finished, and you want to pay with your card.", answer: "Can I have the bill, please? Can I pay by card?" },
    ],
  },
  {
    id: 2,
    slug: "shopping",
    title: "Shopping for clothes",
    kind: "situation",
    canDo: "I can ask for things in a shop, ask the price and buy or return something.",
    grammarSlug: "some-any-much-many",
    phrases: [
      {
        phrase: "I'm just looking",
        meaning: "you don't need help yet",
        example: "No, thanks. I'm just looking.",
        situation: "A shop assistant asks if you need help, but you only want to look around.",
        picture: "{Lan} looking at shirts on a rail in a clothes shop, smiling and shaking her head at a shop assistant.",
      },
      {
        phrase: "I'm looking for a jacket",
        meaning: "you want to find something",
        example: "Excuse me, I'm looking for a jacket.",
        situation: "You need a jacket, so you ask the shop assistant.",
        picture: "{Ben} talking to a shop assistant in a clothes shop, a row of jackets behind them.",
      },
      {
        phrase: "How much is it?",
        meaning: "ask the price",
        example: "I like this bag. How much is it?",
        situation: "You like a bag, but there is no price on it.",
        picture: "{Mai} holding up a small brown handbag with a blank price tag and a questioning face.",
      },
      {
        phrase: "Can I try it on?",
        meaning: "ask to put clothes on to see if they fit",
        example: "This shirt is nice. Can I try it on?",
        situation: "You like a shirt and want to see if it fits you.",
        picture: "{Nam} holding a shirt in front of a changing room curtain in a clothes shop.",
      },
      {
        phrase: "Do you have it in a bigger size?",
        meaning: "ask for the same thing, but bigger",
        example: "These shoes are too small. Do you have them in a bigger size?",
        situation: "You like the shoes, but they are too small for you.",
        picture: "{Ben} sitting in a shoe shop, trying on a shoe that is clearly too small for his foot.",
      },
      {
        phrase: "It's too expensive",
        meaning: "it costs more than you want to pay",
        example: "I like it, but it's too expensive.",
        situation: "The price is much more than you want to pay.",
        picture: "{Hoa} looking surprised at a very long price tag on a coat.",
      },
      {
        phrase: "Do you have anything cheaper?",
        meaning: "ask for something that costs less",
        example: "That's a lot. Do you have anything cheaper?",
        situation: "You like the style, but the price is too high.",
        picture: "{Lan} talking to a shop assistant who is showing her a second, simpler T-shirt.",
      },
      {
        phrase: "I'll take it",
        meaning: "I want to buy it",
        example: "It fits well. I'll take it.",
        situation: "You decide to buy the T-shirt.",
        picture: "{Nam} happily handing a folded T-shirt to a cashier at the shop counter.",
      },
      {
        phrase: "Can I get a bag?",
        meaning: "ask for a bag to carry what you bought",
        example: "Can I get a bag, please?",
        situation: "You bought lots of things and can't carry them in your hands.",
        picture: "{Mai} at a shop counter with many items in her arms, a cashier holding out a paper shopping bag.",
      },
      {
        phrase: "Can I get a refund?",
        meaning: "ask to get your money back",
        example: "This phone case is broken. Can I get a refund?",
        situation: "You bought a phone case yesterday, and it's broken.",
        picture: "{Ben} at a shop counter showing a cracked phone case and a receipt to the cashier.",
      },
    ],
    dialogue: {
      title: "Ben buys a jacket",
      lines: [
        { speaker: "Assistant", text: "Hi there! Can I help you?" },
        { speaker: "Ben", text: "Yes, I'm looking for a jacket.", gap: "I'm looking for a jacket" },
        { speaker: "Assistant", text: "These ones are new this week." },
        { speaker: "Ben", text: "Nice. How much is it?", gap: "How much is it" },
        { speaker: "Assistant", text: "This one is nine hundred thousand." },
        { speaker: "Ben", text: "Hmm, that's a lot. Do you have anything cheaper?", gap: "Do you have anything cheaper" },
        { speaker: "Assistant", text: "This one is six hundred thousand." },
        { speaker: "Ben", text: "Great. Can I try it on?", gap: "Can I try it on" },
        { speaker: "Assistant", text: "Sure. The changing room is over there." },
        { speaker: "Ben", text: "It fits well. I'll take it.", gap: "I'll take it" },
      ],
    },
    speak: [
      { situation: "A shop assistant asks if you need help. You only want to look.", answer: "No, thanks. I'm just looking." },
      { situation: "You like a shirt, but it's too small.", answer: "Do you have it in a bigger size?" },
      { situation: "You bought headphones yesterday, and they don't work.", answer: "These don't work. Can I get a refund?" },
    ],
  },
  {
    id: 3,
    slug: "asking-the-way",
    title: "Asking the way",
    kind: "situation",
    canDo: "I can ask where a place is, understand simple directions and give them.",
    grammarSlug: "questions",
    phrases: [
      {
        phrase: "Where is the station?",
        meaning: "ask where a place is",
        example: "Excuse me, where is the station?",
        situation: "You are lost, and you need to find the train station.",
        picture: "{Tom} holding a map and looking around, confused, on a busy city street.",
      },
      {
        phrase: "Is it far from here?",
        meaning: "ask if a place is a long way away",
        example: "The museum? Is it far from here?",
        situation: "You want to know if you can walk there.",
        picture: "{Tom} talking to {Lan} on a street, a museum building very small in the far distance.",
      },
      {
        phrase: "Go straight on",
        meaning: "keep walking the same way",
        example: "Go straight on for two hundred metres.",
        situation: "You are giving directions. The place is ahead, along this same road.",
        picture: "A long straight street seen from a pavement, with a big arrow painted on the ground pointing forward.",
      },
      {
        phrase: "Turn left",
        meaning: "go to the left",
        example: "Turn left at the corner.",
        situation: "You are giving directions. The person must go to the left at the corner.",
        picture: "A street corner with a road sign arrow pointing to the left.",
      },
      {
        phrase: "Turn right at the traffic lights",
        meaning: "go to the right where the red and green lights are",
        example: "Turn right at the traffic lights, and it's there.",
        situation: "You are giving directions. The person must go right where the red and green lights are.",
        picture: "A crossroads with traffic lights and a curved arrow turning to the right.",
      },
      {
        phrase: "It's on the corner",
        meaning: "it's where two streets meet",
        example: "The café? It's on the corner.",
        situation: "Someone asks where the café is. It's where two streets meet.",
        picture: "A small café building on the corner where two streets meet, seen from above at an angle.",
      },
      {
        phrase: "It's next to the bank",
        meaning: "it's right beside the bank",
        example: "The pharmacy is next to the bank.",
        situation: "Someone asks where the pharmacy is. It's right beside the bank.",
        picture: "A pharmacy with a green cross sign right beside a bank building on a street.",
      },
      {
        phrase: "It's opposite the park",
        meaning: "it's on the other side of the road from the park",
        example: "The hotel is opposite the park.",
        situation: "Someone asks where the hotel is. It's across the road from the park.",
        picture: "A hotel building on one side of a road and a green park with trees on the other side.",
      },
      {
        phrase: "It takes about five minutes",
        meaning: "it's a short time to get there",
        example: "It's not far. It takes about five minutes.",
        situation: "Someone asks how long it takes to walk there. It's a short walk.",
        picture: "{Lan} walking on a pavement next to a big clock showing five minutes passing.",
      },
      {
        phrase: "Could you say that again?",
        meaning: "ask someone to repeat what they said",
        example: "Sorry, could you say that again?",
        situation: "You didn't understand the directions.",
        picture: "{Tom} leaning forward with a hand behind his ear, listening to {Lan} on a noisy street.",
      },
    ],
    dialogue: {
      title: "Tom is lost",
      lines: [
        { speaker: "Tom", text: "Excuse me. Where is the station?", gap: "Where is the station" },
        { speaker: "Lan", text: "The train station? Go straight on, then turn right at the traffic lights." },
        { speaker: "Tom", text: "Sorry, could you say that again?", gap: "Could you say that again" },
        { speaker: "Lan", text: "Sure. Go straight on, then turn right at the traffic lights." },
        { speaker: "Tom", text: "Is it far from here?", gap: "Is it far from here" },
        { speaker: "Lan", text: "No, it takes about five minutes.", gap: "It takes about five minutes" },
        { speaker: "Lan", text: "It's opposite the park.", gap: "It's opposite the park" },
        { speaker: "Tom", text: "Thank you so much!" },
      ],
    },
    speak: [
      { situation: "You can't find the bus station. Ask someone on the street.", answer: "Excuse me, where is the bus station?" },
      { situation: "You didn't catch the directions.", answer: "Sorry, could you say that again?" },
      { situation: "Tell a tourist the museum is across the road from the park.", answer: "The museum is opposite the park." },
    ],
  },
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

// The grammar units' everyday words, as picture-only topics.
const WORD_TOPICS: VocabTopic[] = GRAMMAR_UNITS.map((unit) => ({
  // Situation topics take 1–10, so the word topics come after them.
  id: 10 + unit.id,
  slug: slugify(unit.topic),
  title: unit.topic,
  kind: "words",
  canDo: `I know the everyday words for ${unit.topic.toLowerCase()}.`,
  grammarSlug: unit.slug,
  phrases: unit.words.map((word) => ({ phrase: word.word, meaning: word.meaning, example: word.example, picture: getWordPicture(unit, word) })),
}));

export const VOCAB_TOPICS: VocabTopic[] = [...SITUATION_TOPICS, ...WORD_TOPICS];

export function getVocabTopic(slug: string): VocabTopic | undefined {
  return VOCAB_TOPICS.find((topic) => topic.slug === slug);
}

// The topic whose words a grammar unit uses.
export function getTopicForGrammar(grammarSlug: string): VocabTopic | undefined {
  return WORD_TOPICS.find((topic) => topic.grammarSlug === grammarSlug);
}

// Pictures of situation topics are in public/words/<topic slug>/, made by scripts/grammar-images/generate.mts.
export function getPhrasePicture(topic: VocabTopic, phrase: VocabPhrase): string {
  return topic.kind === "words" ? phrase.picture : `/words/${topic.slug}/${slugify(phrase.phrase)}.webp`;
}

// The phrase as it is blanked and offered as an answer: no final ? . or !
export const getPhraseCore = (phrase: string) => phrase.replace(/[?.!]+$/, "");

// The parts of the lesson a topic has, which all have to be passed to finish it.
export function getTopicChecks(topic: VocabTopic): ("picture" | "situation" | "dialogue")[] {
  return [
    "picture" as const,
    ...(topic.phrases.some((p) => p.situation) ? ["situation" as const] : []),
    ...(topic.dialogue ? ["dialogue" as const] : []),
  ];
}
