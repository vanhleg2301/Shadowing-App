// Daily stories: short texts and small-talk dialogues written for this app, read in the browser's own voice.
// Ids are 11 characters like YouTube ids, so words saved from a story use the same My words storage.

import { MORE_A2_STORIES } from "./stories-a2";

export type StoryKind = "story" | "small-talk";
export type StoryLevel = "A1" | "A2" | "B1";

export interface StoryLine {
  // Set for dialogue lines; story paragraphs have no speaker.
  speaker?: string;
  text: string;
}

export interface StoryWord {
  word: string;
  meaning: string;
  example: string;
}

export interface StoryGrammar {
  point: string;
  explanation: string;
  examples: string[];
}

export interface Story {
  id: string;
  title: string;
  topic: string;
  level: StoryLevel;
  kind: StoryKind;
  summary: string;
  lines: StoryLine[];
  words: StoryWord[];
  grammar: StoryGrammar[];
}

const FIRST_STORIES: Story[] = [
  {
    id: "story-00001",
    title: "My day today",
    topic: "Daily life",
    level: "A1",
    kind: "story",
    summary: "Mai tells us about a normal Monday, from her alarm to bedtime.",
    lines: [
      { text: "My alarm rings at six thirty. I don't want to get up, but I do. I wash my face, make coffee and eat some bread with eggs." },
      { text: "At seven fifteen, I take the bus to work. The bus is always full on Monday. I listen to music and look out of the window." },
      { text: "I work in a small office. In the morning, I answer emails and talk to customers on the phone. At twelve, I have lunch with my friend Hoa. We usually eat noodles near the office." },
      { text: "I finish work at five. On the way home, I buy some vegetables at the market. In the evening, I cook dinner, call my mum and watch one episode of a TV show." },
      { text: "I go to bed at eleven. It was a normal day, but a good one." },
    ],
    words: [
      { word: "alarm", meaning: "a clock or phone sound that wakes you up", example: "My alarm rings at six thirty." },
      { word: "get up", meaning: "leave your bed in the morning", example: "I don't want to get up, but I do." },
      { word: "full", meaning: "with no space left", example: "The bus is always full on Monday." },
      { word: "customer", meaning: "a person who buys something or uses a service", example: "I talk to customers on the phone." },
      { word: "on the way home", meaning: "while you are going home", example: "On the way home, I buy some vegetables." },
      { word: "episode", meaning: "one part of a TV show", example: "I watch one episode of a TV show." },
    ],
    grammar: [
      {
        point: "Present simple for routines",
        explanation: "Use the present simple for things you do every day. Add -s with he, she and it.",
        examples: ["I take the bus to work.", "My alarm rings at six thirty.", "We usually eat noodles near the office."],
      },
      {
        point: "Adverbs of frequency: always, usually",
        explanation: "They say how often. Put them before the main verb, but after be.",
        examples: ["The bus is always full on Monday.", "We usually eat noodles near the office."],
      },
    ],
  },
  {
    id: "story-00002",
    title: "Hi, how are you?",
    topic: "Small talk",
    level: "A1",
    kind: "small-talk",
    summary: "Two neighbours meet at the lift and have a quick, friendly chat.",
    lines: [
      { speaker: "Tom", text: "Morning, Linh! How are you?" },
      { speaker: "Linh", text: "Oh, hi Tom. I'm good, thanks. A bit tired. How about you?" },
      { speaker: "Tom", text: "Not bad. Busy week at work. Are you going to the office?" },
      { speaker: "Linh", text: "Yes, but I'm late again. I missed my first alarm." },
      { speaker: "Tom", text: "Ha, me too, sometimes. Lovely weather today, isn't it?" },
      { speaker: "Linh", text: "Yes, finally! No rain. Well, here's the lift. Have a good day!" },
      { speaker: "Tom", text: "You too. See you later!" },
    ],
    words: [
      { word: "Morning!", meaning: "a short, friendly way to say good morning", example: "Morning, Linh! How are you?" },
      { word: "a bit", meaning: "a little", example: "I'm good, thanks. A bit tired." },
      { word: "Not bad", meaning: "OK, quite good", example: "Not bad. Busy week at work." },
      { word: "miss", meaning: "not hear, see or catch something", example: "I missed my first alarm." },
      { word: "finally", meaning: "after a long time", example: "Yes, finally! No rain." },
      { word: "Have a good day!", meaning: "a friendly goodbye", example: "Well, here's the lift. Have a good day!" },
    ],
    grammar: [
      {
        point: "Question tags: isn't it?",
        explanation: "Add a short question at the end to start a conversation or ask someone to agree.",
        examples: ["Lovely weather today, isn't it?"],
      },
      {
        point: "Short answers in small talk",
        explanation: "In casual speech people drop words: 'Not bad' means 'I'm not bad', 'Busy week' means 'It's a busy week'.",
        examples: ["Not bad.", "Busy week at work.", "You too."],
      },
    ],
  },
  {
    id: "story-00003",
    title: "The weekend at my grandparents'",
    topic: "Family",
    level: "A2",
    kind: "story",
    summary: "Nam spends a quiet weekend in the countryside and learns something new.",
    lines: [
      { text: "Last weekend, I visited my grandparents. They live in a small village about two hours from the city. I went there by bus on Saturday morning." },
      { text: "When I arrived, my grandmother was cooking in the kitchen. The house smelled of fish soup and fresh herbs. My grandfather was working in the garden, so I helped him for an hour." },
      { text: "In the afternoon, we sat outside and drank green tea. My grandfather told me stories about his life when he was young. He didn't have a phone or a TV, but he had a lot of friends." },
      { text: "On Sunday, my grandmother taught me how to make her soup. It was harder than I thought. I put in too much salt, but she laughed and said it was fine." },
      { text: "I came back to the city on Sunday evening. I was tired, but happy. I'm going to visit them again next month." },
    ],
    words: [
      { word: "village", meaning: "a very small town in the countryside", example: "They live in a small village." },
      { word: "smell of", meaning: "have the smell of something", example: "The house smelled of fish soup." },
      { word: "herbs", meaning: "plants used to give food flavour", example: "fresh herbs" },
      { word: "teach someone how to", meaning: "show someone the way to do something", example: "My grandmother taught me how to make her soup." },
      { word: "harder than I thought", meaning: "more difficult than I expected", example: "It was harder than I thought." },
      { word: "too much", meaning: "more than you need", example: "I put in too much salt." },
    ],
    grammar: [
      {
        point: "Past simple vs past continuous",
        explanation: "Use the past continuous (was/were + -ing) for an action in progress, and the past simple for a short action that happens in the middle of it.",
        examples: ["When I arrived, my grandmother was cooking in the kitchen.", "My grandfather was working in the garden, so I helped him."],
      },
      {
        point: "Irregular past forms",
        explanation: "Many common verbs don't take -ed. Learn them as pairs.",
        examples: ["go → went", "teach → taught", "come → came", "tell → told"],
      },
      {
        point: "Going to for plans",
        explanation: "Use be going to + verb for something you have already decided.",
        examples: ["I'm going to visit them again next month."],
      },
    ],
  },
  {
    id: "story-00004",
    title: "Ordering coffee",
    topic: "Food and drink",
    level: "A1",
    kind: "small-talk",
    summary: "A customer orders at a busy café and chats with the barista.",
    lines: [
      { speaker: "Barista", text: "Hi there! What can I get you?" },
      { speaker: "Anna", text: "Hi. Can I have a large latte, please?" },
      { speaker: "Barista", text: "Sure. Hot or iced?" },
      { speaker: "Anna", text: "Iced, please. It's so hot today." },
      { speaker: "Barista", text: "I know! Anything to eat?" },
      { speaker: "Anna", text: "Mm, what do you recommend?" },
      { speaker: "Barista", text: "The banana bread is really good. We made it this morning." },
      { speaker: "Anna", text: "OK, I'll have a piece. Can I pay by card?" },
      { speaker: "Barista", text: "Of course. That's six dollars fifty. Your drink will be ready in two minutes." },
      { speaker: "Anna", text: "Great, thanks!" },
    ],
    words: [
      { word: "What can I get you?", meaning: "what do you want to order?", example: "Hi there! What can I get you?" },
      { word: "Can I have ...?", meaning: "a polite way to order", example: "Can I have a large latte, please?" },
      { word: "iced", meaning: "cold, with ice", example: "Iced, please." },
      { word: "recommend", meaning: "say that something is good and someone should try it", example: "What do you recommend?" },
      { word: "a piece", meaning: "one part of something, like cake", example: "I'll have a piece." },
      { word: "pay by card", meaning: "pay with a bank card, not cash", example: "Can I pay by card?" },
    ],
    grammar: [
      {
        point: "Can I ...? for polite requests",
        explanation: "Use Can I + verb to ask for things in shops and cafés.",
        examples: ["Can I have a large latte, please?", "Can I pay by card?"],
      },
      {
        point: "I'll have ... for decisions",
        explanation: "Use will ('ll) when you decide something at the moment of speaking, for example when you order.",
        examples: ["OK, I'll have a piece."],
      },
    ],
  },
  {
    id: "story-00005",
    title: "A bad start, a good end",
    topic: "Work",
    level: "A2",
    kind: "story",
    summary: "Everything goes wrong for Huy on the day of a big meeting, until it doesn't.",
    lines: [
      { text: "Yesterday was an important day. I had a big meeting with a new customer at nine o'clock. I wanted everything to be perfect." },
      { text: "But my morning was a disaster. First, there was no hot water, so I had a cold shower. Then I spilled coffee on my white shirt. I had to change my clothes, and I left home fifteen minutes late." },
      { text: "The traffic was terrible. While I was waiting at a red light, my phone rang. It was my manager. \"Where are you?\" she asked. I told her I was on my way." },
      { text: "I arrived at the office at five to nine. I ran into the meeting room and took a deep breath. The customer smiled and said, \"Don't worry, I was late too.\"" },
      { text: "The meeting went really well. The customer liked our ideas and agreed to work with us. In the evening, my manager sent me a message: \"Great job today!\" Sometimes a bad start can have a good end." },
    ],
    words: [
      { word: "a disaster", meaning: "something that goes very badly", example: "My morning was a disaster." },
      { word: "spill", meaning: "let liquid fall out by accident", example: "I spilled coffee on my white shirt." },
      { word: "terrible", meaning: "very bad", example: "The traffic was terrible." },
      { word: "on my way", meaning: "travelling to a place now", example: "I told her I was on my way." },
      { word: "take a deep breath", meaning: "breathe in slowly to feel calm", example: "I took a deep breath." },
      { word: "go well", meaning: "be successful", example: "The meeting went really well." },
    ],
    grammar: [
      {
        point: "Sequencing words: first, then",
        explanation: "Use them to tell events in order.",
        examples: ["First, there was no hot water.", "Then I spilled coffee on my white shirt."],
      },
      {
        point: "Had to for past obligation",
        explanation: "Had to + verb is the past of have to / must.",
        examples: ["I had to change my clothes."],
      },
      {
        point: "Reported speech: told / said",
        explanation: "Use tell + person and say without a person. The verb moves one step into the past.",
        examples: ["I told her I was on my way.", "The customer smiled and said, \"Don't worry.\""],
      },
    ],
  },
  {
    id: "story-00006",
    title: "Talking about the weekend",
    topic: "Small talk",
    level: "A2",
    kind: "small-talk",
    summary: "Two colleagues catch up on Monday morning by the coffee machine.",
    lines: [
      { speaker: "Sara", text: "Hey, Minh. Did you have a good weekend?" },
      { speaker: "Minh", text: "Yeah, it was great, thanks. I went hiking with some friends." },
      { speaker: "Sara", text: "Oh, nice! Where did you go?" },
      { speaker: "Minh", text: "To a national park near the city. The views were amazing, but my legs are still sore." },
      { speaker: "Sara", text: "Ha! I'm not surprised. How long did you walk?" },
      { speaker: "Minh", text: "About five hours. What about you? Did you do anything fun?" },
      { speaker: "Sara", text: "Not really. I stayed at home and finally cleaned my flat. Oh, and I watched a really good film on Sunday." },
      { speaker: "Minh", text: "Which one?" },
      { speaker: "Sara", text: "It's called The Long Road. You should watch it. I'll send you the link." },
      { speaker: "Minh", text: "Thanks! Right, I'd better start work. Talk later!" },
    ],
    words: [
      { word: "go hiking", meaning: "go for a long walk in nature", example: "I went hiking with some friends." },
      { word: "the views", meaning: "what you can see from a place", example: "The views were amazing." },
      { word: "sore", meaning: "painful after exercise", example: "My legs are still sore." },
      { word: "Not really.", meaning: "a soft way to say no", example: "Did you do anything fun? Not really." },
      { word: "You should ...", meaning: "a friendly way to give advice", example: "You should watch it." },
      { word: "I'd better ...", meaning: "I need to do this now", example: "Right, I'd better start work." },
    ],
    grammar: [
      {
        point: "Past simple questions with did",
        explanation: "Did + subject + base verb. Don't use the past form after did.",
        examples: ["Did you have a good weekend?", "Where did you go?", "How long did you walk?"],
      },
      {
        point: "Should for advice",
        explanation: "Should + base verb.",
        examples: ["You should watch it."],
      },
    ],
  },
  {
    id: "story-00007",
    title: "Lost in a new city",
    topic: "Travel",
    level: "A2",
    kind: "story",
    summary: "On her first trip abroad alone, Lan gets lost and finds help.",
    lines: [
      { text: "Last summer, I travelled to Singapore alone for the first time. I was excited, but also a little nervous." },
      { text: "On my second day, I decided to walk to a famous market. I didn't use a map because I thought I knew the way. That was a mistake. After thirty minutes, I was completely lost, and my phone battery was almost dead." },
      { text: "I stopped an old man and asked, \"Excuse me, could you tell me how to get to the market?\" He smiled and said it was quite far. Then he walked with me to the bus stop and showed me which bus to take." },
      { text: "On the bus, a young woman heard me ask the driver about the market. She was going there too, so we got off together. We ate lunch at the market and talked for an hour. We still send each other messages." },
      { text: "I learned two things that day: always charge your phone, and don't be afraid to ask for help." },
    ],
    words: [
      { word: "alone", meaning: "without other people", example: "I travelled to Singapore alone." },
      { word: "nervous", meaning: "a little worried or afraid", example: "I was excited, but also a little nervous." },
      { word: "completely lost", meaning: "not knowing at all where you are", example: "I was completely lost." },
      { word: "dead (battery)", meaning: "with no power left", example: "My phone battery was almost dead." },
      { word: "get off", meaning: "leave a bus or train", example: "We got off together." },
      { word: "charge", meaning: "put power into a phone battery", example: "Always charge your phone." },
    ],
    grammar: [
      {
        point: "Could you ...? for polite questions",
        explanation: "Could you is more polite than can you. Good for asking strangers.",
        examples: ["Could you tell me how to get to the market?"],
      },
      {
        point: "Because and so",
        explanation: "Because gives the reason; so gives the result.",
        examples: ["I didn't use a map because I thought I knew the way.", "She was going there too, so we got off together."],
      },
    ],
  },
  {
    id: "story-00008",
    title: "At the doctor's",
    topic: "Health",
    level: "A2",
    kind: "small-talk",
    summary: "A patient explains how they feel and the doctor gives advice.",
    lines: [
      { speaker: "Doctor", text: "Good morning. Come in and sit down. What seems to be the problem?" },
      { speaker: "Khoa", text: "I've had a sore throat and a headache for three days. I feel tired all the time." },
      { speaker: "Doctor", text: "Have you got a temperature?" },
      { speaker: "Khoa", text: "Yes, a little. It was thirty-eight degrees last night." },
      { speaker: "Doctor", text: "OK. Let me have a look. Open your mouth and say \"ah\"." },
      { speaker: "Khoa", text: "Ah." },
      { speaker: "Doctor", text: "Your throat is quite red. I think it's a virus, so you don't need antibiotics. You should rest, drink lots of water and take this medicine twice a day." },
      { speaker: "Khoa", text: "Can I go to work?" },
      { speaker: "Doctor", text: "I'd stay at home for two days. If you don't feel better by Friday, come back and see me." },
      { speaker: "Khoa", text: "OK. Thank you, doctor." },
    ],
    words: [
      { word: "What seems to be the problem?", meaning: "what is wrong? (doctors often say this)", example: "Come in. What seems to be the problem?" },
      { word: "sore throat", meaning: "pain in your throat", example: "I've had a sore throat for three days." },
      { word: "temperature", meaning: "a body heat that is higher than normal", example: "Have you got a temperature?" },
      { word: "have a look", meaning: "look at something quickly", example: "Let me have a look." },
      { word: "rest", meaning: "relax and not work", example: "You should rest." },
      { word: "twice a day", meaning: "two times every day", example: "Take this medicine twice a day." },
    ],
    grammar: [
      {
        point: "Present perfect with for",
        explanation: "Use have/has + past participle + for + a time to say how long something has been true until now.",
        examples: ["I've had a sore throat and a headache for three days."],
      },
      {
        point: "First conditional: if + present, then will / imperative",
        explanation: "Talk about a possible situation in the future.",
        examples: ["If you don't feel better by Friday, come back and see me."],
      },
    ],
  },
  {
    id: "story-00009",
    title: "My first job interview",
    topic: "Work",
    level: "B1",
    kind: "story",
    summary: "Phuong remembers her first interview and the question she wasn't ready for.",
    lines: [
      { text: "I'll never forget my first job interview. I was twenty-two and had just finished university. I had prepared answers to all the usual questions, and I had practised them in front of the mirror for days." },
      { text: "The interview started well. The manager asked me about my studies and why I wanted the job, and I answered without any problems. Then she asked something I hadn't expected: \"Tell me about a time you failed.\"" },
      { text: "My mind went blank. For a few seconds, I couldn't say anything. Finally, I told her the truth. In my second year, I had failed an exam because I hadn't studied enough. I explained that after that, I had changed the way I studied and got much better results." },
      { text: "A week later, they called and offered me the job. Later, the manager told me that my answer about failing was the reason she chose me. \"Everyone fails,\" she said. \"I wanted someone who learns from it.\"" },
    ],
    words: [
      { word: "prepare", meaning: "get ready for something", example: "I had prepared answers to all the usual questions." },
      { word: "expect", meaning: "think something will happen", example: "She asked something I hadn't expected." },
      { word: "fail", meaning: "not succeed", example: "Tell me about a time you failed." },
      { word: "my mind went blank", meaning: "I suddenly couldn't think of anything", example: "My mind went blank." },
      { word: "offer someone a job", meaning: "say they can have the job", example: "They called and offered me the job." },
      { word: "learn from", meaning: "get better because of an experience", example: "I wanted someone who learns from it." },
    ],
    grammar: [
      {
        point: "Past perfect: had + past participle",
        explanation: "Use it for something that happened before another past event.",
        examples: ["I had just finished university.", "She asked something I hadn't expected.", "I had failed an exam because I hadn't studied enough."],
      },
      {
        point: "Will never forget",
        explanation: "A strong way to say a memory is very important to you.",
        examples: ["I'll never forget my first job interview."],
      },
    ],
  },
  {
    id: "story-00010",
    title: "Meeting someone new",
    topic: "Small talk",
    level: "A2",
    kind: "small-talk",
    summary: "Two guests start talking at a friend's birthday party.",
    lines: [
      { speaker: "James", text: "Hi, I don't think we've met. I'm James." },
      { speaker: "Vy", text: "Nice to meet you, James. I'm Vy. How do you know Mark?" },
      { speaker: "James", text: "We work together. And you?" },
      { speaker: "Vy", text: "We were at university together. We've been friends for about ten years." },
      { speaker: "James", text: "Wow, that's a long time. So what do you do, Vy?" },
      { speaker: "Vy", text: "I'm a graphic designer. I work from home most days." },
      { speaker: "James", text: "That sounds nice. Do you like working from home?" },
      { speaker: "Vy", text: "Mostly, yes. But sometimes I miss having people around. That's why I love parties like this!" },
      { speaker: "James", text: "Ha, me too. Can I get you a drink?" },
      { speaker: "Vy", text: "Sure, I'd love some juice. Thanks." },
    ],
    words: [
      { word: "I don't think we've met.", meaning: "a polite way to start talking to someone new", example: "Hi, I don't think we've met. I'm James." },
      { word: "How do you know ...?", meaning: "how did you become friends with ...?", example: "How do you know Mark?" },
      { word: "work from home", meaning: "do your job at home, not in an office", example: "I work from home most days." },
      { word: "That sounds nice.", meaning: "a friendly reaction to news", example: "That sounds nice." },
      { word: "miss", meaning: "feel sad because you don't have something any more", example: "Sometimes I miss having people around." },
      { word: "Can I get you ...?", meaning: "a polite offer", example: "Can I get you a drink?" },
    ],
    grammar: [
      {
        point: "Present perfect with for (how long)",
        explanation: "Use it for something that started in the past and is still true.",
        examples: ["We've been friends for about ten years."],
      },
      {
        point: "Would love for polite answers",
        explanation: "I'd love ... is a warm way to say yes to an offer.",
        examples: ["Sure, I'd love some juice."],
      },
    ],
  },
  {
    id: "story-00011",
    title: "Shopping for a gift",
    topic: "Shopping",
    level: "A2",
    kind: "story",
    summary: "Tuan has one hour to find a birthday present for his sister.",
    lines: [
      { text: "My sister's birthday was on Saturday, and on Friday evening I still didn't have a present for her. So after work, I went to the shopping centre." },
      { text: "First, I looked at bags. There was a nice black one, but it was too expensive. Then I went to a bookshop. My sister loves reading, but I couldn't remember which books she already had." },
      { text: "I was starting to worry when I saw a small shop that sold plants. My sister has just moved into a new flat, and she said it looked empty. I asked the shop assistant for advice. She said the easiest plant to look after was a snake plant, because it doesn't need much water or light." },
      { text: "I bought one in a white pot and asked her to wrap it. It cost less than the bag, and it was perfect. On Saturday, my sister was really happy. She put it next to her window and called it \"Tuan\"." },
    ],
    words: [
      { word: "present", meaning: "a gift", example: "I still didn't have a present for her." },
      { word: "expensive", meaning: "costing a lot of money", example: "It was too expensive." },
      { word: "shop assistant", meaning: "a person who helps customers in a shop", example: "I asked the shop assistant for advice." },
      { word: "look after", meaning: "take care of", example: "The easiest plant to look after." },
      { word: "wrap", meaning: "cover a present with paper", example: "I asked her to wrap it." },
      { word: "cost", meaning: "have a price of", example: "It cost less than the bag." },
    ],
    grammar: [
      {
        point: "Too + adjective",
        explanation: "Too means more than you want. It is negative.",
        examples: ["It was too expensive."],
      },
      {
        point: "Comparatives and superlatives",
        explanation: "Less ... than compares two things; the easiest is the top of a group.",
        examples: ["It cost less than the bag.", "The easiest plant to look after was a snake plant."],
      },
    ],
  },
  {
    id: "story-00012",
    title: "Asking for directions",
    topic: "Travel",
    level: "A1",
    kind: "small-talk",
    summary: "A tourist asks a local how to get to the train station.",
    lines: [
      { speaker: "Tourist", text: "Excuse me. Is there a train station near here?" },
      { speaker: "Local", text: "Yes, there is. It's about ten minutes on foot." },
      { speaker: "Tourist", text: "Great. How do I get there?" },
      { speaker: "Local", text: "Go straight down this street. At the traffic lights, turn left. Then take the second street on the right." },
      { speaker: "Tourist", text: "Straight, left at the lights, then second right. OK." },
      { speaker: "Local", text: "That's it. The station is opposite a big supermarket. You can't miss it." },
      { speaker: "Tourist", text: "Thank you so much!" },
      { speaker: "Local", text: "No problem. Enjoy your trip!" },
    ],
    words: [
      { word: "near here", meaning: "close to this place", example: "Is there a train station near here?" },
      { word: "on foot", meaning: "walking", example: "It's about ten minutes on foot." },
      { word: "go straight", meaning: "keep going in the same direction", example: "Go straight down this street." },
      { word: "traffic lights", meaning: "red, yellow and green lights for cars", example: "At the traffic lights, turn left." },
      { word: "opposite", meaning: "on the other side, facing", example: "The station is opposite a big supermarket." },
      { word: "You can't miss it.", meaning: "it is very easy to see", example: "You can't miss it." },
    ],
    grammar: [
      {
        point: "Imperatives for directions",
        explanation: "Use the base verb with no subject: go, turn, take.",
        examples: ["Go straight down this street.", "Turn left.", "Take the second street on the right."],
      },
      {
        point: "Is there ...? / There is",
        explanation: "Ask and say that something exists in a place.",
        examples: ["Is there a train station near here?", "Yes, there is."],
      },
    ],
  },
  {
    id: "story-00013",
    title: "Rainy season",
    topic: "Weather",
    level: "A2",
    kind: "story",
    summary: "A sudden storm changes Long's plans, and that turns out fine.",
    lines: [
      { text: "In my city, the rainy season starts in May. The mornings are usually sunny, but in the afternoon, the sky can change very quickly." },
      { text: "Last Tuesday, I was riding my motorbike home when it started to rain. At first, it was only a little, so I didn't stop. Five minutes later, it was pouring. I couldn't see the road clearly, and the water on the street was getting deeper." },
      { text: "I stopped at a small café and waited inside. I was completely wet. The owner gave me a towel and a cup of hot ginger tea. \"This happens every day,\" she laughed. \"You should always carry a raincoat.\"" },
      { text: "The rain didn't stop for an hour, so I sat by the window and read the news on my phone. It was actually a very relaxing hour. Now I always keep a raincoat under my seat, but I still visit that café sometimes." },
    ],
    words: [
      { word: "rainy season", meaning: "the months of the year with a lot of rain", example: "The rainy season starts in May." },
      { word: "pour", meaning: "rain very heavily", example: "Five minutes later, it was pouring." },
      { word: "deep", meaning: "going far down", example: "The water was getting deeper." },
      { word: "wet", meaning: "covered in water", example: "I was completely wet." },
      { word: "raincoat", meaning: "a coat that keeps the rain off", example: "You should always carry a raincoat." },
      { word: "relaxing", meaning: "making you feel calm", example: "It was actually a very relaxing hour." },
    ],
    grammar: [
      {
        point: "Getting + comparative for change",
        explanation: "Use get + comparative adjective to show something slowly changing.",
        examples: ["The water on the street was getting deeper."],
      },
      {
        point: "Was + -ing ... when + past simple",
        explanation: "A longer action is interrupted by a shorter one.",
        examples: ["I was riding my motorbike home when it started to rain."],
      },
    ],
  },
  {
    id: "story-00014",
    title: "Making weekend plans",
    topic: "Small talk",
    level: "A2",
    kind: "small-talk",
    summary: "Two friends decide what to do on Saturday.",
    lines: [
      { speaker: "Ha", text: "Are you free on Saturday?" },
      { speaker: "Ben", text: "In the afternoon, yes. I've got a football match in the morning. Why?" },
      { speaker: "Ha", text: "There's a food festival in the park. Do you want to go?" },
      { speaker: "Ben", text: "That sounds fun! What time does it start?" },
      { speaker: "Ha", text: "It's open from ten until nine. How about meeting at three?" },
      { speaker: "Ben", text: "Three is perfect. Shall we meet at the main gate?" },
      { speaker: "Ha", text: "Good idea. Let's not eat lunch, so we can try everything!" },
      { speaker: "Ben", text: "Ha, deal. I'll ask Chris too. He loves street food." },
      { speaker: "Ha", text: "Great. See you on Saturday, then." },
    ],
    words: [
      { word: "Are you free ...?", meaning: "do you have time ...?", example: "Are you free on Saturday?" },
      { word: "festival", meaning: "a big public event, often with music or food", example: "There's a food festival in the park." },
      { word: "How about ...?", meaning: "a way to suggest something", example: "How about meeting at three?" },
      { word: "Shall we ...?", meaning: "a way to suggest doing something together", example: "Shall we meet at the main gate?" },
      { word: "Deal.", meaning: "OK, I agree", example: "Ha, deal." },
      { word: "street food", meaning: "food cooked and sold outside", example: "He loves street food." },
    ],
    grammar: [
      {
        point: "Making suggestions",
        explanation: "How about + -ing, Shall we + verb, Let's + verb.",
        examples: ["How about meeting at three?", "Shall we meet at the main gate?", "Let's not eat lunch."],
      },
      {
        point: "Present continuous / have got for arrangements",
        explanation: "Talk about fixed plans for the future.",
        examples: ["I've got a football match in the morning."],
      },
    ],
  },
  {
    id: "story-00015",
    title: "Learning to cook",
    topic: "Food and drink",
    level: "A2",
    kind: "story",
    summary: "Quang moved out and had to learn to cook, one burnt dish at a time.",
    lines: [
      { text: "When I moved into my own flat last year, I couldn't cook at all. For the first month, I ate instant noodles almost every day. I felt tired and I was spending too much money on takeaway." },
      { text: "So I decided to learn. I started with very simple dishes, like fried eggs and rice. Then I watched cooking videos online and tried a new recipe every weekend." },
      { text: "Not everything went well. Once I burnt the chicken so badly that the smoke alarm went off. Another time, I used sugar instead of salt. My flatmate still laughs about it." },
      { text: "But slowly, I got better. Now I can cook about ten dishes, and my friends come to my place for dinner every month. Cooking has become my favourite way to relax after work." },
    ],
    words: [
      { word: "move into", meaning: "start living in a new home", example: "When I moved into my own flat ..." },
      { word: "takeaway", meaning: "food you buy from a restaurant to eat at home", example: "I was spending too much money on takeaway." },
      { word: "recipe", meaning: "instructions for cooking a dish", example: "I tried a new recipe every weekend." },
      { word: "burn", meaning: "cook too much so it turns black", example: "I burnt the chicken." },
      { word: "go off (alarm)", meaning: "start ringing", example: "The smoke alarm went off." },
      { word: "instead of", meaning: "in the place of", example: "I used sugar instead of salt." },
    ],
    grammar: [
      {
        point: "Could / couldn't for past ability",
        explanation: "Could is the past of can.",
        examples: ["I couldn't cook at all."],
      },
      {
        point: "So + adjective/adverb + that",
        explanation: "Shows a result of something very strong.",
        examples: ["I burnt the chicken so badly that the smoke alarm went off."],
      },
      {
        point: "Present perfect for a change until now",
        explanation: "Has/have + past participle shows a result that is true now.",
        examples: ["Cooking has become my favourite way to relax."],
      },
    ],
  },
  {
    id: "story-00016",
    title: "Saying no politely",
    topic: "Small talk",
    level: "B1",
    kind: "small-talk",
    summary: "A colleague asks for help at a bad time, and Thu says no without being rude.",
    lines: [
      { speaker: "Kevin", text: "Hi Thu, have you got a minute?" },
      { speaker: "Thu", text: "Sure, what's up?" },
      { speaker: "Kevin", text: "I'm working on the sales report and I'm a bit stuck. Could you help me with the charts this afternoon?" },
      { speaker: "Thu", text: "I'd really like to help, but I'm afraid I can't today. I've got a deadline at five." },
      { speaker: "Kevin", text: "Oh, no worries. I understand." },
      { speaker: "Thu", text: "How about tomorrow morning? I'm free after ten." },
      { speaker: "Kevin", text: "That would be great, actually. The report isn't due until Thursday." },
      { speaker: "Thu", text: "Perfect. In the meantime, have a look at last month's file. The charts are set up the same way." },
      { speaker: "Kevin", text: "Good idea. Thanks, Thu. Good luck with your deadline!" },
    ],
    words: [
      { word: "Have you got a minute?", meaning: "can I talk to you for a short time?", example: "Hi Thu, have you got a minute?" },
      { word: "stuck", meaning: "not able to continue", example: "I'm a bit stuck." },
      { word: "I'm afraid ...", meaning: "a polite way to give bad news", example: "I'm afraid I can't today." },
      { word: "deadline", meaning: "the time when work must be finished", example: "I've got a deadline at five." },
      { word: "due", meaning: "expected or needed at a certain time", example: "The report isn't due until Thursday." },
      { word: "in the meantime", meaning: "while you wait", example: "In the meantime, have a look at last month's file." },
    ],
    grammar: [
      {
        point: "Softening a no: I'd like to ..., but I'm afraid ...",
        explanation: "Show you want to help, say no, give a reason, then offer another time.",
        examples: ["I'd really like to help, but I'm afraid I can't today.", "How about tomorrow morning?"],
      },
      {
        point: "Not ... until",
        explanation: "Means something happens only at that time, not before.",
        examples: ["The report isn't due until Thursday."],
      },
    ],
  },
];

export const STORIES: Story[] = [...FIRST_STORIES, ...MORE_A2_STORIES];

export const STORY_TOPICS = [...new Set(STORIES.map((s) => s.topic))];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

// One story a day for everyone, in the list's order, changing at midnight UTC.
export function getStoryOfTheDay(date = new Date()): Story {
  const day = Math.floor(date.getTime() / 86_400_000);
  return STORIES[day % STORIES.length];
}

// Sentences for reading aloud and tapping: each line split at . ! ? (keeping quotes with their sentence).
export function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+["”]?\s*|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

// "Small talk · A2" or "Story · Travel · A2", without repeating "Small talk" twice.
export function getStoryLabel(story: Story): string {
  const kind = story.kind === "small-talk" ? "Small talk" : "Story";
  return [kind, story.topic === kind ? null : story.topic, story.level].filter(Boolean).join(" · ");
}
