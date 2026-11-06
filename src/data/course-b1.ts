// "Natural speed": the course for the natural-speed collections (BBC, Easy Street, Studio C). Learners at about
// B1 get used to fast, real English by hearing each video cold first, then until all of it is clear. Week 1 is
// hand-picked here; later weeks are built from the collection (src/data/course-weeks.ts).

import type { CollectionId } from "./collections";
import { DAY_TEST_TITLE, getRestDayBlocks, type CourseBlock, type CourseDay } from "./course-a2";

export const COURSE_B1_ID = "natural-b1-7";

export function getCourseB1Id(collection: CollectionId): string {
  return `${COURSE_B1_ID}:${collection}`;
}

// Base videos are BBC Learning English. Studio C uses them too: its sketches have no stored transcripts, and each
// day is built from its main video's transcript. Easy Street replaces them day by day below.
export const COURSE_B1_DAYS: CourseDay[] = [
  {
    day: 1,
    title: "Small talk",
    canDo: "I can start a casual chat, keep it going and react naturally.",
    videos: [
      { id: "d0GKyzG9OWA", title: "Talking About Socialising" },
      { id: "31y2Bq1RYQA", title: "Saying Where You're From" },
      { id: "wUF33157hYI", title: "Talking About Likes and Dislikes" },
    ],
    phrases: [
      { text: "How's it going?", meaning: "a casual 'how are you?'", example: "Hey Tom, how's it going?" },
      { text: "Not bad, you?", meaning: "a quick, natural answer that asks back", example: "Not bad, you? Busy week?" },
      { text: "So, what brings you here?", meaning: "ask why someone has come", example: "So, what brings you here tonight?" },
      { text: "No way!", meaning: "show surprise", example: "You met the president? No way!" },
      { text: "That makes sense", meaning: "I understand why", example: "You're tired after the flight? That makes sense." },
      { text: "Fair enough", meaning: "OK, I accept that", example: "You'd rather stay in? Fair enough." },
      { text: "I know what you mean", meaning: "I feel the same", example: "I know what you mean, Mondays are hard." },
      { text: "Same here", meaning: "me too", example: "I hate the cold. — Same here." },
      { text: "Have you been here before?", meaning: "an easy question to start a chat", example: "Have you been here before? The coffee is great." },
      { text: "By the way", meaning: "change the topic a little", example: "By the way, I love your jacket." },
      { text: "Anyway", meaning: "go back to the main topic, or end the chat", example: "Anyway, I should get going." },
      { text: "Let's keep in touch", meaning: "let's talk again later", example: "It was great to meet you. Let's keep in touch." },
      { text: "What do you mean?", meaning: "ask someone to explain", example: "What do you mean, 'not exactly'?" },
      { text: "I didn't catch that", meaning: "I didn't hear or understand", example: "Sorry, I didn't catch that. One more time?" },
      { text: "Catch you later", meaning: "a casual goodbye", example: "OK, I'm off. Catch you later!" },
    ],
    speakingPrompts: [
      "You meet someone at a party. Start the conversation and ask two questions.",
      "Someone tells you they just quit their job. React, then ask a follow-up question.",
      "Describe the last time you talked to a stranger. What happened?",
      "Retell the main video in 1 minute, in your own words, without looking at the transcript.",
      "You didn't understand what someone said. Ask them to repeat it in two different ways.",
    ],
  },
  {
    day: 2,
    title: "Family and friends",
    canDo: "I can tell a short story about people I know and how we get on.",
    videos: [
      { id: "v9EU41cuhHY", title: "How to Describe Your Family" },
      { id: "lHZCWPdQr80", title: "Talking About Housemates" },
      { id: "0UIcwcYrPek", title: "Talking About Pets" },
    ],
    phrases: [
      { text: "We grew up together", meaning: "we were children in the same place", example: "Jake and I grew up together." },
      { text: "We're really close", meaning: "we have a strong relationship", example: "My sister and I are really close." },
      { text: "We don't really get along", meaning: "we often disagree", example: "My cousin and I don't really get along." },
      { text: "He takes after his dad", meaning: "he is similar to his father", example: "He's so funny. He takes after his dad." },
      { text: "We lost touch", meaning: "we stopped talking to each other", example: "We were best friends, but we lost touch." },
      { text: "I hang out with", meaning: "I spend free time with", example: "On weekends I hang out with my old school friends." },
      { text: "She's always there for me", meaning: "she helps me when I need it", example: "My mum is always there for me." },
      { text: "It drives me crazy", meaning: "it annoys me a lot", example: "He's always late. It drives me crazy." },
      { text: "To be honest", meaning: "I'm telling you what I really think", example: "To be honest, I prefer small parties." },
      { text: "The thing is", meaning: "introduce the main problem", example: "The thing is, my brother never listens." },
      { text: "It turns out that", meaning: "in the end, we found out that", example: "It turns out that she was planning a surprise." },
      { text: "Long story short", meaning: "to tell it quickly", example: "Long story short, we missed the train." },
      { text: "We ended up", meaning: "in the end we did something", example: "We ended up staying until midnight." },
      { text: "Get together", meaning: "meet as a group", example: "The whole family gets together at New Year." },
      { text: "Make up", meaning: "become friends again after a fight", example: "They argued, but they made up the next day." },
    ],
    speakingPrompts: [
      "Talk about a friend you have known for a long time. How did you meet?",
      "Who in your family are you most like? Why?",
      "Tell a short story about a family event that went wrong. Use 'long story short'.",
      "Retell the main video in 1 minute, in your own words, without looking at the transcript.",
      "What is something a friend or family member does that drives you crazy?",
    ],
  },
  {
    day: 3,
    title: "Shopping and services",
    canDo: "I can ask for what I want, deal with a problem and complain politely.",
    videos: [
      { id: "2mnL9jPVzsk", title: "Clothes Shopping" },
      { id: "E3G-dsvZHGU", title: "When Is It OK to Complain?" },
      { id: "bVRIpmjTSxM", title: "Talking About Restaurants" },
    ],
    phrases: [
      { text: "I'm just looking, thanks", meaning: "I don't need help yet", example: "Can I help you? — I'm just looking, thanks." },
      { text: "Do you have this in a smaller size?", meaning: "ask for another size", example: "Do you have this in a smaller size?" },
      { text: "I'll take it", meaning: "I'll buy it", example: "It fits perfectly. I'll take it." },
      { text: "Could I get", meaning: "a natural way to order", example: "Could I get a large coffee to go?" },
      { text: "Is it OK if I pay by card?", meaning: "ask about payment", example: "Is it OK if I pay by card?" },
      { text: "There seems to be a problem with", meaning: "start a polite complaint", example: "There seems to be a problem with my order." },
      { text: "It's not what I ordered", meaning: "I got the wrong thing", example: "Sorry, it's not what I ordered." },
      { text: "Could you take a look?", meaning: "ask someone to check", example: "My laptop won't start. Could you take a look?" },
      { text: "I'd like a refund", meaning: "I want my money back", example: "It broke after one day. I'd like a refund." },
      { text: "Can I exchange it?", meaning: "can I change it for another one", example: "It's the wrong colour. Can I exchange it?" },
      { text: "How long will it take?", meaning: "ask about time", example: "How long will it take to fix?" },
      { text: "That's a rip-off", meaning: "that's much too expensive", example: "Twenty dollars for a sandwich? That's a rip-off." },
      { text: "I've been waiting for ages", meaning: "I've waited a very long time", example: "Excuse me, I've been waiting for ages." },
      { text: "I appreciate it", meaning: "thank you for your help", example: "Thanks for sorting that out. I appreciate it." },
      { text: "Sorry to bother you", meaning: "a polite way to interrupt", example: "Sorry to bother you, but where is the checkout?" },
    ],
    speakingPrompts: [
      "You bought headphones and one side doesn't work. Explain the problem to the shop assistant.",
      "Order your favourite meal in a café, with one change to it.",
      "Tell me about a time you waited a long time for something. What happened?",
      "Retell the main video in 1 minute, in your own words, without looking at the transcript.",
      "Is it OK to complain in a restaurant in your country? Give an example.",
    ],
  },
  {
    day: 4,
    title: "Work and school",
    canDo: "I can make requests, ask for help and talk about my job or studies.",
    videos: [
      { id: "O6h8qq5rBi0", title: "Talking About the Office" },
      { id: "VFA53-P4yPo", title: "How Do Job Interviews Make You Feel?" },
      { id: "DjA3naFOTvc", title: "Talking About School" },
    ],
    phrases: [
      { text: "Do you have a minute?", meaning: "can I talk to you now?", example: "Hi Sarah, do you have a minute?" },
      { text: "Would you mind", meaning: "a polite request", example: "Would you mind checking this for me?" },
      { text: "I'm stuck on", meaning: "I can't finish something", example: "I'm stuck on this report." },
      { text: "Could you walk me through it?", meaning: "explain it step by step", example: "I'm new to this. Could you walk me through it?" },
      { text: "I'm in charge of", meaning: "I am responsible for", example: "I'm in charge of the social media accounts." },
      { text: "I'm good at", meaning: "talk about a strength", example: "I'm good at solving problems." },
      { text: "I'm working on", meaning: "say what you are doing now", example: "I'm working on a new project." },
      { text: "The deadline is", meaning: "say when work must be finished", example: "The deadline is Friday at five." },
      { text: "I'll get back to you", meaning: "I'll answer you later", example: "Let me check and I'll get back to you." },
      { text: "Just to be clear", meaning: "check you understand", example: "Just to be clear, you need it by Monday?" },
      { text: "I'm swamped", meaning: "I'm very busy", example: "Sorry, I'm swamped this week." },
      { text: "Let me know if", meaning: "tell me if", example: "Let me know if you need anything else." },
      { text: "I'd be happy to", meaning: "a friendly yes", example: "Can you help? — I'd be happy to." },
      { text: "What I'm trying to say is", meaning: "explain your idea again", example: "What I'm trying to say is, we need more time." },
      { text: "Thanks for your patience", meaning: "thank someone for waiting", example: "Thanks for your patience, it's ready now." },
    ],
    speakingPrompts: [
      "Answer this interview question: 'Tell me about yourself.' Speak for 1 minute.",
      "You're stuck on a task. Ask a colleague or teacher for help.",
      "What's the worst teacher or boss you've had? What did they do?",
      "Retell the main video in 1 minute, in your own words, without looking at the transcript.",
      "Ask your boss for a day off next Friday, politely, and give a reason.",
    ],
  },
  {
    day: 5,
    title: "Feelings and opinions",
    canDo: "I can say how I feel, give my opinion and disagree politely.",
    videos: [
      { id: "qfQ61oYIbxY", title: "Are You in a Good or Bad Mood?" },
      { id: "fLB70DZdqIE", title: "Talking About Your Worries" },
      { id: "gL6DT-PdLoQ", title: "Talking About Confidence" },
    ],
    phrases: [
      { text: "I'm a bit down", meaning: "I'm a little sad", example: "I'm a bit down today. I didn't sleep well." },
      { text: "I'm over the moon", meaning: "I'm very happy", example: "I got the job! I'm over the moon." },
      { text: "It really gets on my nerves", meaning: "it annoys me", example: "Loud music at night really gets on my nerves." },
      { text: "I'm not a big fan of", meaning: "I don't really like", example: "I'm not a big fan of horror films." },
      { text: "If you ask me", meaning: "in my opinion", example: "If you ask me, it's too expensive." },
      { text: "I see your point, but", meaning: "disagree politely", example: "I see your point, but I still think it's risky." },
      { text: "I'm not so sure about that", meaning: "I don't fully agree", example: "Cats are better than dogs? I'm not so sure about that." },
      { text: "That's a good point", meaning: "I agree with that idea", example: "That's a good point. I hadn't thought of that." },
      { text: "It depends", meaning: "the answer changes with the situation", example: "Do I like parties? It depends who's there." },
      { text: "I can't stand", meaning: "I really hate", example: "I can't stand waiting in queues." },
      { text: "It's not a big deal", meaning: "it's not important", example: "You forgot? It's not a big deal." },
      { text: "I was so embarrassed", meaning: "I felt stupid in front of others", example: "I called her by the wrong name. I was so embarrassed." },
      { text: "Have a crush on", meaning: "secretly like someone romantically", example: "He has a crush on his neighbour." },
      { text: "Ask someone out", meaning: "invite someone on a date", example: "He finally asked her out." },
      { text: "Let's agree to disagree", meaning: "we won't change each other's mind", example: "OK, let's agree to disagree." },
    ],
    speakingPrompts: [
      "How are you feeling today, really? Explain why.",
      "Give your opinion: are dating apps a good way to meet people?",
      "Someone says 'English is easy.' Disagree politely and give a reason.",
      "Retell the main video in 1 minute, in your own words, without looking at the transcript.",
      "Tell me about a time you were really embarrassed.",
    ],
  },
];

const COLLECTION_DAY_VIDEOS: Partial<Record<CollectionId, Record<number, CourseDay["videos"]>>> = {
  "easy-street": {
    1: [
      { id: "TwBYlBjbokU", title: "Everyday Conversations With Strangers" },
      { id: "rPgykzyHg6I", title: "Small Talk Advice" },
      { id: "nvhcPK_IsIQ", title: "Why Do British People Love the Pub?" },
    ],
    2: [
      { id: "0cPmzcW5l1I", title: "What Are Your Plans Today? (Part 2)" },
      { id: "JjEJQzRQFa0", title: "Conversations in the Past, Present and Future" },
      { id: "ogNynYq1IxE", title: "Where Do Brits Go on Summer Holiday?" },
    ],
    3: [
      { id: "b7WcAmzNZ88", title: "Everyday Conversations for Shopping" },
      { id: "yl--RTTtKLs", title: "Conversations for Shopping" },
      { id: "7WvW2KZm8S0", title: "Favourite Food" },
    ],
    4: [
      { id: "-WB_SGqeJo8", title: "What Do You Do for a Living?" },
      { id: "v8ecvyglvJ8", title: "Conversations for Tourists" },
      { id: "S3gaSvXqLH0", title: "Advice for Travelling by Train" },
    ],
    5: [
      { id: "yb21A3vrsOM", title: "What Makes People Happy?" },
      { id: "ScO8_gSXqJQ", title: "What Are Your Phobias?" },
      { id: "H3zJIP3BJ6Y", title: "Advice on Mental Health" },
    ],
  },
};

export function getB1DayVideos(day: CourseDay, collection: CollectionId): CourseDay["videos"] {
  return day.day > 7 ? day.videos : (COLLECTION_DAY_VIDEOS[collection]?.[day.day] ?? day.videos);
}

// At B1 the main video is heard cold first, as real conversations are; its words and sentences come after.
export function getB1Blocks(day: CourseDay, collection: CollectionId): CourseBlock[] {
  if (day.kind === "review" || day.kind === "free") return getRestDayBlocks(day);
  const [main, second, extra] = getB1DayVideos(day, collection);
  return [
    ...(day.day > 1 ? [{ id: "review", kind: "review" as const, title: "Warm up: yesterday's sentences, by ear", minutes: 5 }] : []),
    { id: "listen-1", kind: "listen", title: `Listen 1, no subtitles: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "words", kind: "words", title: "Words and chunks from the video", minutes: 10 },
    { id: "readalong-1", kind: "readalong", title: `Listen 2, with the text: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "phrases", kind: "phrases", title: "Sentences from the video", minutes: 10 },
    { id: "shadow-1", kind: "shadow", title: `Shadow: ${main.title}`, minutes: 15, videoId: main.id },
    { id: "relisten-1", kind: "readalong", title: `Listen 3, straight through: ${main.title}`, minutes: 10, videoId: main.id },
    { id: "quiz", kind: "quiz", title: DAY_TEST_TITLE, minutes: 10 },
    ...(second ? [{ id: "listen-2", kind: "listen" as const, title: `Same topic, no subtitles: ${second.title}`, minutes: 15, videoId: second.id, isOptional: true }] : []),
    { id: "speak", kind: "speak", title: "Speak: retell the video in your own words", minutes: 10, isOptional: true },
    ...(extra ? [{ id: "extra", kind: "extra" as const, title: `Bonus listening: ${extra.title}`, minutes: 15, videoId: extra.id, isOptional: true }] : []),
  ];
}
