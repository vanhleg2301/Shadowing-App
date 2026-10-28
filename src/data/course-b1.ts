// "Natural speed in 7 days": for the natural-speed collections (BBC, Easy Street, Studio C). Learners at
// about B1 get used to fast, real English and answer back quickly. Almost all the time goes to listening
// (first without subtitles) and speaking (shadowing, retelling, role-play); grammar and writing come later.

import type { CollectionId } from "./collections";
import type { CourseBlock, CourseDay } from "./course-a2";

export const COURSE_B1_ID = "natural-b1-7";

export function getCourseB1Id(collection: CollectionId): string {
  return `${COURSE_B1_ID}:${collection}`;
}

// Base videos are BBC Learning English; other collections replace them day by day below.
export const COURSE_B1_DAYS: CourseDay[] = [
  {
    day: 1,
    title: "Small talk",
    canDo: "I can start a casual chat, keep it going and react naturally.",
    videos: [
      { id: "d0GKyzG9OWA", title: "Talking About Socialising" },
      { id: "u6QrbYDsj1g", title: "Anxious About Talking to New People?" },
      { id: "Qk-69B86pEo", title: "Networking" },
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
      { id: "0b1sPJq1BaA", title: "Talking About Friends" },
      { id: "x72gP4HrU58", title: "Talking About Family" },
      { id: "mxwJsvMj7JA", title: "Making \"Mum Friends\"" },
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
      { id: "GfFqCV02J0E", title: "Placing an Order" },
      { id: "E3G-dsvZHGU", title: "When Is It OK to Complain?" },
      { id: "7CCaA8lfJkU", title: "Dealing With IT Support" },
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
      { id: "sj-dX3fZmq0", title: "Answering Interview Questions" },
      { id: "AG2kYShBZl0", title: "Asking for Help at Work" },
      { id: "QWBwCoecvkM", title: "Making Polite Requests" },
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
      { id: "yyClpj_GJDc", title: "How to Talk About Your Feelings" },
      { id: "F5h3tLtgVrI", title: "Disagreeing Politely" },
      { id: "s94XlBnJwZU", title: "Are Dating Apps Effective?" },
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
  {
    day: 6,
    title: "When things go wrong",
    canDo: "I can apologise, explain a misunderstanding and ask for help in a problem.",
    videos: [
      { id: "qR34I4S9qUA", title: "Saying You're Sorry" },
      { id: "bDVrNLKG1bg", title: "Explaining a Misunderstanding" },
      { id: "eK5Tsornvng", title: "Talking About Mistakes" },
    ],
    phrases: [
      { text: "My bad", meaning: "a casual 'it was my mistake'", example: "Oops, I took your seat. My bad!" },
      { text: "I'm so sorry about", meaning: "apologise for something", example: "I'm so sorry about last night." },
      { text: "It was an accident", meaning: "I didn't do it on purpose", example: "I didn't mean to break it. It was an accident." },
      { text: "I didn't mean to", meaning: "it wasn't my plan", example: "I didn't mean to upset you." },
      { text: "There's been a misunderstanding", meaning: "someone understood it wrong", example: "I think there's been a misunderstanding." },
      { text: "What I meant was", meaning: "explain what you really wanted to say", example: "What I meant was, we could meet later." },
      { text: "It won't happen again", meaning: "a promise after a mistake", example: "Sorry I was late. It won't happen again." },
      { text: "Don't worry about it", meaning: "it's OK, I forgive you", example: "Don't worry about it. Everyone makes mistakes." },
      { text: "I've lost my", meaning: "report something missing", example: "I've lost my wallet. Can you help me?" },
      { text: "Someone stole my", meaning: "report a theft", example: "Someone stole my bike from outside the station." },
      { text: "Calm down", meaning: "relax, don't panic", example: "Calm down, we'll find a solution." },
      { text: "What happened?", meaning: "ask about a problem", example: "You look upset. What happened?" },
      { text: "It's not my fault", meaning: "I didn't cause it", example: "The printer broke? It's not my fault!" },
      { text: "Let's sort it out", meaning: "let's fix the problem", example: "Let's sort it out before the meeting." },
      { text: "That was close", meaning: "something bad almost happened", example: "We nearly missed the flight. That was close!" },
    ],
    speakingPrompts: [
      "You forgot your friend's birthday. Call them and apologise.",
      "You've lost your bag in a train station. Explain to the staff what happened and what it looks like.",
      "Tell me about a big mistake you made and what you learned.",
      "Retell the main video in 1 minute, in your own words, without looking at the transcript.",
      "A friend thinks you were rude, but it was a misunderstanding. Explain what you meant.",
    ],
  },
  {
    day: 7,
    title: "Review: tell a good story",
    canDo: "I can tell a funny or surprising story at natural speed and react to other people's stories.",
    videos: [
      { id: "kTf0V4HyFtM", title: "What You Did Last Weekend" },
      { id: "BSABmr8hX7s", title: "Talking About Films" },
      { id: "yHNOHXFbP78", title: "Talking About Your Childhood" },
    ],
    phrases: [
      { text: "You won't believe what happened", meaning: "start an exciting story", example: "You won't believe what happened on the bus today." },
      { text: "So there I was", meaning: "set the scene in a story", example: "So there I was, in the rain, with no umbrella." },
      { text: "All of a sudden", meaning: "suddenly", example: "All of a sudden, the lights went out." },
      { text: "Out of nowhere", meaning: "with no warning", example: "A dog ran out of nowhere." },
      { text: "I couldn't believe it", meaning: "I was very surprised", example: "It was my old teacher! I couldn't believe it." },
      { text: "And then", meaning: "move the story forward", example: "And then he started singing." },
      { text: "The funny thing is", meaning: "point to the funny part", example: "The funny thing is, he didn't even notice." },
      { text: "In the end", meaning: "finally", example: "In the end, we laughed about it." },
      { text: "Spoiler alert", meaning: "warning: I'm going to tell you the ending", example: "Spoiler alert: the dog survives." },
      { text: "It reminds me of", meaning: "it makes me think of", example: "That reminds me of my first job." },
      { text: "What happened next?", meaning: "ask the speaker to go on", example: "Wait, what happened next?" },
      { text: "Seriously?", meaning: "really? (surprise)", example: "He forgot the ring? Seriously?" },
      { text: "That's hilarious", meaning: "that's very funny", example: "You fell into the pool? That's hilarious." },
      { text: "You had to be there", meaning: "it was funnier in person", example: "OK, it doesn't sound funny. You had to be there." },
      { text: "Anyway, that's what happened", meaning: "end a story", example: "Anyway, that's what happened. Crazy day." },
    ],
    speakingPrompts: [
      "Tell a funny or surprising story from your life in 2 minutes. Use 'all of a sudden' and 'in the end'.",
      "Describe a film or show you love without giving away the ending.",
      "Your friend tells you they met a celebrity. React and ask three questions.",
      "Retell one of this week's videos in 1 minute, in your own words.",
      "What was the hardest part of this week's listening? What will you practise next?",
    ],
  },
];

const COLLECTION_DAY_VIDEOS: Partial<Record<CollectionId, Record<number, CourseDay["videos"]>>> = {
  "studio-c": {
    1: [
      { id: "8t5PXQX4E1o", title: "Easily Offended Friends" },
      { id: "HWsaHqtkzk4", title: "Two Truths and a Lie" },
      { id: "lKimaAhyakc", title: "Would You Rather" },
    ],
    2: [
      { id: "6ee1CntEVyU", title: "A Bad Family Game Night" },
      { id: "9EckItGk5r8", title: "Christmas Cards" },
      { id: "Aw3u_o9L5QU", title: "Betting On Friends Goes Too Far" },
    ],
    3: [
      { id: "ZjdKPDsYA7o", title: "Longest Grocery Store Checkout Line" },
      { id: "YIGEwAuWpB8", title: "Crazy Mall Kiosk Salesman" },
      { id: "PL5q8HOYVU0", title: "The Restaurant of Life" },
    ],
    4: [
      { id: "K72dRv5ejIc", title: "Worst Teacher Ever" },
      { id: "y5Lfa_zLD1Q", title: "Career Placement Test" },
      { id: "puZb1VUdo2M", title: "Foreign Exchange" },
    ],
    5: [
      { id: "ktUHAp1zxFc", title: "How to Read Flirting Signals" },
      { id: "G3yzzHMgRWk", title: "Most Accurate Mood Ring" },
      { id: "3GeaFfhaYkI", title: "Operation Breakup" },
    ],
    6: [
      { id: "yJc921NJqNM", title: "Worst Doctor Ever" },
      { id: "OyGwyBoLEiI", title: "Worst Cop Ever" },
      { id: "tu3v87_97Hc", title: "Robbery Stopped by Philosophical Questions" },
    ],
    7: [
      { id: "LXSj1y9kl2Y", title: "Movie Trailer That Spoils Everything" },
      { id: "hcdI20liY50", title: "Spoiler Alert" },
      { id: "CE1UZY-7bq8", title: "Flip a Coin Worst Luck Ever" },
    ],
  },
  // Easy Street has few short videos, so days 6 and 7 keep the BBC ones.
  "easy-street": {
    1: [
      { id: "AFer9rgkvPs", title: "British Hobbies" },
      { id: "nvhcPK_IsIQ", title: "Why Do British People Love the Pub?" },
      { id: "HOn6vWFzHw4", title: "The \"Don'ts\" of UK Culture" },
    ],
    2: [
      { id: "0cPmzcW5l1I", title: "What Are Your Plans Today? (Part 2)" },
      { id: "JjEJQzRQFa0", title: "Conversations in the Past, Present and Future" },
      { id: "ogNynYq1IxE", title: "Where Do Brits Go on Summer Holiday?" },
    ],
    3: [
      { id: "b7WcAmzNZ88", title: "Everyday Conversations for Shopping" },
      { id: "DGdO1h9hBno", title: "Do People Love Junk Food?" },
      { id: "BaS1iZs_AQ8", title: "Are British People Vegetarian?" },
    ],
    4: [
      { id: "j1fh6RTIxx4", title: "Conversations and Words for Work" },
      { id: "v8ecvyglvJ8", title: "Conversations for Tourists" },
      { id: "S3gaSvXqLH0", title: "Advice for Travelling by Train" },
    ],
    5: [
      { id: "yb21A3vrsOM", title: "What Makes People Happy?" },
      { id: "OHN9xZywzm0", title: "The Best British Bands and Music" },
      { id: "Yuvi8elkqvU", title: "What Is the Best Horror Movie?" },
    ],
  },
};

function getDayVideos(day: CourseDay, collection: CollectionId): CourseDay["videos"] {
  return COLLECTION_DAY_VIDEOS[collection]?.[day.day] ?? day.videos;
}

// Every video is heard first without subtitles, then shadowed; the speaking block ends with a retelling.
export function getB1Blocks(day: CourseDay, collection: CollectionId): CourseBlock[] {
  const [main, second, extra] = getDayVideos(day, collection);
  return [
    ...(day.day > 1 ? [{ id: "review", kind: "review" as const, title: "Warm up: review yesterday's phrases", minutes: 10 }] : []),
    { id: "listen-1", kind: "listen", title: `Listen without subtitles: ${main.title}`, minutes: 20, videoId: main.id },
    { id: "shadow-1", kind: "shadow", title: `Shadow: ${main.title}`, minutes: 40, videoId: main.id },
    { id: "phrases", kind: "phrases", title: "Learn today's 15 phrases", minutes: 15 },
    { id: "listen-2", kind: "listen", title: `Listen without subtitles: ${second.title}`, minutes: 15, videoId: second.id },
    { id: "shadow-2", kind: "shadow", title: `Shadow: ${second.title}`, minutes: 30, videoId: second.id },
    { id: "speak", kind: "speak", title: "Speak: answer and retell out loud", minutes: 30 },
    { id: "roleplay", kind: "roleplay", title: "Role-play: act out a real conversation", minutes: 20 },
    { id: "quiz", kind: "quiz", title: "Quiz: check today's phrases", minutes: 10 },
    { id: "extra", kind: "extra", title: `Bonus shadowing: ${extra.title}`, minutes: 30, videoId: extra.id, isOptional: true },
  ];
}
