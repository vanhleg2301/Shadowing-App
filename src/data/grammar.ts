// "Grammar & Words": grammar learned the comprehensible-input way. Each unit starts with a short story that uses
// one pattern again and again, then shows the pattern, plays it in real course videos, checks that it is
// understood (not drilled) and ends with saying it. The stories are written for this app.

export interface GrammarQuestion {
  question: string;
  // The right answer first; the check shuffles them.
  options: string[];
}

export interface GrammarUnit {
  id: number;
  slug: string;
  title: string;
  level: "A1" | "A2" | "B1";
  // What the learner can do after the unit, in plain words.
  canDo: string;
  story: { title: string; lines: string[] };
  // Shown in bold wherever they appear in the story.
  pattern: string[];
  explanation: string[];
  // Phrases searched for in Bob the Canadian and English Sponge transcripts.
  videoPhrases: string[];
  // About the story first, then about what the pattern means.
  check: GrammarQuestion[];
  speak: { shadow: string[]; prompts: string[] };
}

export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    id: 1,
    slug: "present-simple",
    title: "Every day: the present simple",
    level: "A1",
    canDo: "I can talk about my routine and things that are always true.",
    story: {
      title: "Mai's Monday",
      lines: [
        "Mai lives in Da Nang with her sister.",
        "She works at a small hotel near the beach.",
        "Every morning, she wakes up at six o'clock.",
        "She drinks a glass of water and she goes for a walk.",
        "Her sister doesn't get up early. She sleeps until eight.",
        "Mai starts work at half past seven.",
        "She answers the phone and she helps the guests.",
        "Most guests speak English, so she uses English every day.",
        "At lunchtime, she usually eats rice and fish.",
        "She doesn't like coffee, so she drinks tea.",
        "After work, she watches a video in English for twenty minutes.",
        "Does she understand every word? No, she doesn't. But she understands more every week.",
      ],
    },
    pattern: ["lives", "works", "wakes up", "drinks", "goes", "doesn't get up", "sleeps", "starts", "answers", "helps", "speak", "uses", "eats", "doesn't like", "watches", "Does she understand", "doesn't", "understands"],
    explanation: [
      "Use the present simple for routines (every day, usually, on Mondays) and things that are always true.",
      "With he, she and it, add -s: she works, he goes, it starts. Words ending in -ch, -sh or -o add -es: watches, goes.",
      "For no, use don't or doesn't plus the plain verb: I don't drink coffee, she doesn't like coffee.",
      "For questions, use do or does: Do you work? Does she understand?",
    ],
    videoPhrases: ["I usually", "every day I", "every morning", "I don't like"],
    check: [
      { question: "What time does Mai wake up?", options: ["At six o'clock", "At eight o'clock", "At half past seven", "At noon"] },
      { question: "Why does Mai use English every day?", options: ["Most guests speak English", "Her sister is English", "She teaches English", "She watches films at work"] },
      { question: "What does Mai drink at lunch?", options: ["Tea", "Coffee", "Juice", "Nothing"] },
      { question: "\"She wakes up at six.\" When does this happen?", options: ["Most days, it's her routine", "Only today", "Yesterday", "Next week"] },
      { question: "Which one is right?", options: ["Her sister doesn't get up early.", "Her sister don't get up early.", "Her sister doesn't gets up early.", "Her sister not get up early."] },
      { question: "\"Does she understand every word?\" What is it asking about?", options: ["Something true in general", "Something that happened yesterday", "A plan for tomorrow", "Something happening right now only"] },
    ],
    speak: {
      shadow: ["Every morning, she wakes up at six o'clock.", "She doesn't like coffee, so she drinks tea.", "After work, she watches a video in English."],
      prompts: ["What time do you usually get up, and what do you do first?", "What do you do after work or school? Say three things."],
    },
  },
  {
    id: 2,
    slug: "past-simple",
    title: "Telling a story: the past simple",
    level: "A2",
    canDo: "I can tell what happened yesterday or on a trip.",
    story: {
      title: "A very bad Saturday",
      lines: [
        "Last Saturday, I woke up late.",
        "My phone didn't ring because I forgot to charge it.",
        "I jumped out of bed and I ran to the bus stop.",
        "The bus left one minute before I arrived.",
        "So I walked to the station. It started to rain, and I didn't have an umbrella.",
        "When I got to the cafe, my friend Nam was already there.",
        "\"You're late,\" he said. \"Did you sleep well?\"",
        "\"No, I didn't,\" I said. \"I watched videos until two in the morning.\"",
        "We ordered two coffees and a big piece of cake.",
        "Then I looked for my wallet. It wasn't in my bag.",
        "Nam laughed and paid for everything.",
        "In the end, it was a good day. I had cake, and I didn't pay for it.",
      ],
    },
    pattern: ["woke up", "didn't ring", "forgot", "jumped", "ran", "left", "arrived", "walked", "started", "didn't have", "got", "was", "said", "Did you sleep", "didn't", "watched", "ordered", "looked", "wasn't", "laughed", "paid", "had", "didn't pay"],
    explanation: [
      "Use the past simple for things that started and finished in the past: yesterday, last Saturday, two years ago.",
      "Many verbs add -ed: walked, started, watched. Common verbs have their own form: go → went, have → had, get → got, run → ran, pay → paid.",
      "For no, use didn't plus the plain verb: I didn't have an umbrella (not didn't had).",
      "For questions, use did plus the plain verb: Did you sleep well? What did you do?",
    ],
    videoPhrases: ["yesterday I", "I went to", "I bought", "I didn't"],
    check: [
      { question: "Why was the writer late?", options: ["The phone didn't ring", "The bus was very slow", "Nam called late", "It was raining in the morning"] },
      { question: "Why didn't the writer sleep well?", options: ["They watched videos until 2 a.m.", "They were ill", "The neighbours were loud", "They worked late"] },
      { question: "Who paid at the cafe?", options: ["Nam", "The writer", "They paid half each", "Nobody"] },
      { question: "\"I ran to the bus stop.\" When did this happen?", options: ["In the past, and it is finished", "Every Saturday", "Right now", "Tomorrow"] },
      { question: "Which one is right?", options: ["I didn't have an umbrella.", "I didn't had an umbrella.", "I don't had an umbrella.", "I not have an umbrella."] },
      { question: "What is the past of \"pay\"?", options: ["paid", "payed", "pay", "paying"] },
    ],
    speak: {
      shadow: ["Last Saturday, I woke up late.", "The bus left one minute before I arrived.", "Nam laughed and paid for everything."],
      prompts: ["What did you do last weekend? Say four things, in order.", "Tell a short story about a bad day or a lucky day."],
    },
  },
  {
    id: 3,
    slug: "going-to",
    title: "Plans: going to",
    level: "A2",
    canDo: "I can talk about my plans for the weekend or a trip.",
    story: {
      title: "The trip to Da Lat",
      lines: [
        "Next week, Linh and her brother are going to visit Da Lat.",
        "They're going to take the night bus on Friday.",
        "\"I'm not going to sleep on the bus,\" says Linh. \"I'm going to watch the stars.\"",
        "Her brother laughs. \"You're going to be tired.\"",
        "On Saturday morning, they're going to rent two motorbikes.",
        "Linh is going to take a lot of photos of the flowers and the lake.",
        "Her brother is going to try every coffee shop in the city.",
        "In the evening, they're going to eat at the night market.",
        "\"What are you going to buy?\" asks her brother.",
        "\"I'm going to buy a warm jacket. Da Lat is cold at night.\"",
        "Look at those clouds. It's going to rain soon.",
        "But they aren't going to stay inside. They're going to buy umbrellas.",
      ],
    },
    pattern: ["are going to visit", "'re going to take", "'m not going to sleep", "'m going to watch", "'re going to be", "'re going to rent", "is going to take", "is going to try", "'re going to eat", "are you going to buy", "'m going to buy", "'s going to rain", "aren't going to stay", "'re going to buy"],
    explanation: [
      "Use be going to + verb for plans you have already made: I'm going to visit my parents on Sunday.",
      "Also use it when you can see something is about to happen: Look at those clouds. It's going to rain.",
      "No: I'm not going to, she isn't going to, they aren't going to.",
      "Questions: What are you going to do? Is she going to come?",
      "In fast speech, going to often sounds like \"gonna\". You will hear it in videos.",
    ],
    videoPhrases: ["I'm going to", "we're going to", "are you going to"],
    check: [
      { question: "How are Linh and her brother going to travel to Da Lat?", options: ["By night bus", "By plane", "By train", "By motorbike"] },
      { question: "What is Linh going to buy at the night market?", options: ["A warm jacket", "Coffee", "Flowers", "A motorbike"] },
      { question: "What is the brother going to do in Da Lat?", options: ["Try every coffee shop", "Take photos of the lake", "Sleep all day", "Buy a jacket"] },
      { question: "\"They're going to rent motorbikes.\" What does this tell you?", options: ["It is a plan for the future", "It happened last week", "They do it every week", "They are doing it now"] },
      { question: "\"Look at those clouds. It's going to rain.\" Why does the speaker say this?", options: ["They can see it will happen soon", "It rained yesterday", "It rains every day", "They want it to rain"] },
    ],
    speak: {
      shadow: ["Next week, we're going to visit Da Lat.", "I'm not going to sleep on the bus.", "Look at those clouds. It's going to rain soon."],
      prompts: ["What are you going to do this weekend?", "Talk about a trip you're going to take: where, when, and what you're going to do there."],
    },
  },
  {
    id: 4,
    slug: "can-could",
    title: "Asking politely: can and could",
    level: "A2",
    canDo: "I can ask for things and ask what is possible, politely.",
    story: {
      title: "At the hotel desk",
      lines: [
        "Guest: Hi. Can I check in, please? My name is Tom Green.",
        "Receptionist: Of course. Could I see your passport?",
        "Guest: Here you are. Can I pay by card?",
        "Receptionist: Yes, you can. Your room is on the fifth floor.",
        "Guest: Could you help me with my bags? They're very heavy.",
        "Receptionist: Sure, I can do that.",
        "Guest: Thanks. Can I use the Wi-Fi in my room?",
        "Receptionist: Yes. The password is on this card.",
        "Guest: And could you recommend a good place for dinner?",
        "Receptionist: There's a great fish restaurant across the street. You can walk there in two minutes.",
        "Guest: Can I book a table from here?",
        "Receptionist: I'm sorry, I can't book it for you, but you can call them. Here's the number.",
      ],
    },
    pattern: ["Can I check in", "Could I see", "Can I pay", "you can", "Could you help", "I can do", "Can I use", "could you recommend", "You can walk", "Can I book", "I can't book", "you can call"],
    explanation: [
      "Can I + verb asks for something for you: Can I pay by card? Can I use the Wi-Fi?",
      "Could you + verb asks someone to do something for you: Could you help me? Could you recommend a restaurant?",
      "Could is a little more polite than can. Both are fine in shops, cafes and hotels.",
      "Can also says something is possible: You can walk there in two minutes. No: can't.",
    ],
    videoPhrases: ["could I have", "could I get", "can I"],
    check: [
      { question: "What does the receptionist want to see?", options: ["The guest's passport", "The guest's ticket", "A credit card", "The booking email"] },
      { question: "Where is the fish restaurant?", options: ["Across the street", "On the fifth floor", "Next to the station", "Inside the hotel"] },
      { question: "Why can't the receptionist book a table?", options: ["She can't, but the guest can call", "The restaurant is closed", "It is too late", "The guest has no phone"] },
      { question: "\"Could you help me with my bags?\" What is the guest doing?", options: ["Asking someone to do something", "Saying he is able to do something", "Talking about the past", "Giving an order"] },
      { question: "Which is the most polite way to ask?", options: ["Could you recommend a restaurant?", "Recommend a restaurant.", "You recommend a restaurant.", "I want a restaurant."] },
    ],
    speak: {
      shadow: ["Can I pay by card?", "Could you help me with my bags?", "Could you recommend a good place for dinner?"],
      prompts: ["You are in a cafe. Ask for a drink and ask if you can sit by the window.", "Ask a hotel receptionist for two things, politely, using could you."],
    },
  },
  {
    id: 5,
    slug: "questions",
    title: "Keeping a chat going: questions",
    level: "A2",
    canDo: "I can ask questions to start and keep a conversation going.",
    story: {
      title: "A new classmate",
      lines: [
        "Hoa: Hi! Are you new here?",
        "Ben: Yes, it's my first day. I'm Ben.",
        "Hoa: Nice to meet you, Ben. Where are you from?",
        "Ben: I'm from Australia. I moved here last month.",
        "Hoa: Really? Why did you come to Vietnam?",
        "Ben: My company sent me. I work for a travel app.",
        "Hoa: Cool. Do you like it here?",
        "Ben: I love it. The food is amazing. What do you do?",
        "Hoa: I'm a nurse. How long have you been in Hanoi?",
        "Ben: About four weeks. Which street food should I try first?",
        "Hoa: Bun cha, of course! Are you free after class? I can show you a good place.",
        "Ben: That sounds great. What time does class finish?",
      ],
    },
    pattern: ["Are you new", "Where are you from", "Why did you come", "Do you like", "What do you do", "How long have you been", "Which street food should I try", "Are you free", "What time does class finish"],
    explanation: [
      "Most questions start with a small helping word, then the person, then the verb: Do you like it? Did you come? Are you free?",
      "Put a question word first for more information: Where are you from? What do you do? Why did you come? How long have you been here?",
      "With be, just swap the order: You are new → Are you new?",
      "Asking questions back (\"What do you do?\") is how you keep a conversation going.",
    ],
    videoPhrases: ["what do you", "do you have", "where did you"],
    check: [
      { question: "Where is Ben from?", options: ["Australia", "England", "Canada", "Vietnam"] },
      { question: "Why did Ben come to Vietnam?", options: ["His company sent him", "He wanted to study", "He married a Vietnamese woman", "He is on holiday"] },
      { question: "What is Hoa's job?", options: ["A nurse", "A teacher", "A cook", "She works for a travel app"] },
      { question: "Which question asks about someone's job?", options: ["What do you do?", "How do you do?", "Where do you do?", "What are you doing now?"] },
      { question: "Which one is right?", options: ["Why did you come to Vietnam?", "Why you came to Vietnam?", "Why did you came to Vietnam?", "Why you did come to Vietnam?"] },
    ],
    speak: {
      shadow: ["Nice to meet you. Where are you from?", "Why did you come to Vietnam?", "What time does class finish?"],
      prompts: ["You meet someone new. Ask them four questions.", "Answer Hoa's questions about yourself: where are you from, what do you do, do you like your city?"],
    },
  },
  {
    id: 6,
    slug: "present-perfect",
    title: "Life experiences: have you ever…?",
    level: "B1",
    canDo: "I can talk about things I have or haven't done in my life.",
    story: {
      title: "Two friends, two lives",
      lines: [
        "Quang has travelled to nine countries.",
        "He has seen the snow in Japan and he has swum in the sea in Thailand.",
        "He has never been to Europe, but he wants to go next year.",
        "His friend Duc hasn't travelled much. He has lived in the same town all his life.",
        "But Duc has read more than three hundred books.",
        "He has learned to cook food from twenty countries, from his own kitchen.",
        "\"Have you ever eaten real Italian pizza?\" Quang asks.",
        "\"No, I haven't,\" says Duc. \"But I've made it about fifty times.\"",
        "\"Have you ever been on a plane?\"",
        "\"Yes, once. I flew to Ho Chi Minh City in 2019.\"",
        "Quang smiles. \"So you've seen the world in your books, and I've seen it from the window.\"",
        "\"Maybe we've both done it right,\" says Duc.",
      ],
    },
    pattern: ["has travelled", "has seen", "has swum", "has never been", "hasn't travelled", "has lived", "has read", "has learned", "Have you ever eaten", "I haven't", "I've made", "Have you ever been", "you've seen", "I've seen", "we've both done"],
    explanation: [
      "Use have / has + past participle for experiences in your life, when the exact time is not important: I've been to Japan. She has read 300 books.",
      "Ever means \"at any time in your life\": Have you ever eaten pizza? Never means \"not at any time\": I've never been to Europe.",
      "When you say the exact time, use the past simple: I flew to Ho Chi Minh City in 2019 (not I have flown in 2019).",
      "In speech, have and has are short: I've, you've, she's, we've.",
    ],
    videoPhrases: ["I've never", "have you ever", "I have always"],
    check: [
      { question: "How many countries has Quang travelled to?", options: ["Nine", "Twenty", "Three", "None"] },
      { question: "How has Duc \"seen the world\"?", options: ["In books and by cooking", "On many trips", "Through his window", "In films"] },
      { question: "When did Duc fly to Ho Chi Minh City?", options: ["In 2019", "Last year", "He has never flown", "Next year"] },
      { question: "\"I've never been to Europe.\" What does this mean?", options: ["Not at any time in my life", "Not yesterday", "Not now, but tomorrow", "I don't like Europe"] },
      { question: "Which one is right?", options: ["I flew there in 2019.", "I have flown there in 2019.", "I have fly there in 2019.", "I've flew there in 2019."] },
    ],
    speak: {
      shadow: ["He has never been to Europe.", "Have you ever eaten real Italian pizza?", "No, I haven't. But I've made it many times."],
      prompts: ["Say three things you have done in your life, and one thing you've never done.", "Ask a friend two \"Have you ever…?\" questions, then answer them yourself."],
    },
  },
];

export function getGrammarUnit(slug: string): GrammarUnit | undefined {
  return GRAMMAR_UNITS.find((unit) => unit.slug === slug);
}

export const GRAMMAR_COURSE_ID = "grammar-1";
