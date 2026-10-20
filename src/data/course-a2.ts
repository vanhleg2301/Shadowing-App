// "Speak A2 in 7 days": for learners who already understand A2 English but freeze when speaking.
// Time goes mostly to output (shadowing, speaking prompts); input is short and targeted.
// Content is written by hand, so the course costs nothing to run.

export const COURSE_ID = "speak-a2-7";

export type BlockKind = "review" | "listen" | "phrases" | "shadow" | "dictation" | "speak" | "extra";

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
  day: number;
  title: string;
  canDo: string;
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
  {
    day: 6,
    title: "Health and appointments",
    canDo: "I can explain how I feel, book a doctor's appointment and understand advice.",
    videos: [
      { id: "QwyqiTMtKr8", title: "Tom Goes To The Doctor!" },
      { id: "0BLczS0yqXg", title: "Getting A Cold!" },
      { id: "7tQMyLTcF_I", title: "Talking About Exercise" },
    ],
    phrases: [
      { text: "I don't feel well", meaning: "you feel ill", example: "I don't feel well. I think I have a fever." },
      { text: "I've got a headache", meaning: "your head hurts", example: "I've got a headache and a sore throat." },
      { text: "It hurts when I", meaning: "say when you feel pain", example: "It hurts when I walk." },
      { text: "Since yesterday", meaning: "from yesterday until now", example: "I've had a cough since yesterday." },
      { text: "I'd like to make an appointment", meaning: "ask to see a doctor at a time", example: "I'd like to make an appointment with a doctor." },
      { text: "Is it serious?", meaning: "ask if the problem is dangerous", example: "Is it serious, doctor?" },
      { text: "How often should I take it?", meaning: "ask about medicine times", example: "How often should I take these tablets?" },
      { text: "You should rest", meaning: "advice to stop and relax", example: "You should rest and drink lots of water." },
      { text: "I'm feeling better", meaning: "you are less ill now", example: "Thanks, I'm feeling better today." },
      { text: "I need to call in sick", meaning: "tell work you are ill and can't come", example: "I need to call in sick today." },
      { text: "Take care", meaning: "a kind way to say goodbye", example: "Get well soon, and take care!" },
      { text: "I try to stay active", meaning: "you try to move and exercise", example: "I try to stay active, so I walk every day." },
      { text: "I'm out of breath", meaning: "you are breathing fast after exercise", example: "Wait, I'm out of breath!" },
      { text: "Get well soon", meaning: "hope someone stops being ill", example: "Sorry to hear that. Get well soon!" },
      { text: "Do you have anything for", meaning: "ask a pharmacist for medicine", example: "Do you have anything for a cold?" },
    ],
    speakingPrompts: [
      "Call the doctor's office and make an appointment. Explain your problem.",
      "Tell the doctor your symptoms: what hurts and since when.",
      "Go to a pharmacy and ask for something for a cold.",
      "Call your manager: you are ill and can't come to work.",
      "How do you stay healthy? Talk about food, sleep and exercise.",
    ],
  },
  {
    day: 7,
    title: "Review: a day of travel",
    canDo: "I can handle a full day abroad: small talk, food, shopping, directions and problems.",
    videos: [
      { id: "k78JLH9lJMg", title: "My New Zealand Trip" },
      { id: "4igRJivBVHw", title: "Talking About Weather" },
      { id: "lX01A3gIgyo", title: "My South East Asia Trip" },
    ],
    phrases: [
      { text: "Lovely weather today, isn't it?", meaning: "easy small talk with a stranger", example: "Lovely weather today, isn't it? — Yes, finally!" },
      { text: "It's freezing", meaning: "very cold", example: "Put on a coat, it's freezing outside." },
      { text: "Have you been here before?", meaning: "small talk when travelling", example: "Have you been here before? — No, it's my first time." },
      { text: "I've never been to", meaning: "you have not visited a place", example: "I've never been to New Zealand." },
      { text: "It was amazing", meaning: "it was very, very good", example: "The view from the top was amazing." },
      { text: "The best part was", meaning: "talk about your favourite moment", example: "The best part was the boat trip." },
      { text: "I checked in at", meaning: "you arrived and registered at a hotel", example: "I checked in at the hotel at three." },
      { text: "There's a problem with my room", meaning: "complain politely at a hotel", example: "Sorry, there's a problem with my room. The shower doesn't work." },
      { text: "Could you recommend somewhere to eat?", meaning: "ask locals for a restaurant", example: "Could you recommend somewhere to eat near here?" },
      { text: "What time does it open?", meaning: "ask about opening hours", example: "What time does the museum open?" },
      { text: "I'd rather", meaning: "say what you prefer", example: "I'd rather walk than take the bus." },
      { text: "That sounds great", meaning: "you like an idea", example: "A picnic by the lake? That sounds great." },
      { text: "I'm not sure, but", meaning: "give an answer you are not certain about", example: "I'm not sure, but I think it's on the left." },
      { text: "Could you take a photo of us?", meaning: "ask a stranger to take a picture", example: "Excuse me, could you take a photo of us?" },
      { text: "Thanks for your help", meaning: "thank someone who helped you", example: "That's perfect. Thanks for your help!" },
    ],
    speakingPrompts: [
      "Make small talk about the weather with someone at a bus stop.",
      "Tell a friend about your best trip: where, when, and the best part.",
      "At the hotel, your room has a problem. Explain it and ask for help.",
      "Ask a local to recommend a place to eat, then order there.",
      "Final test: talk for 2 minutes about yourself, your day, and your next holiday plan.",
    ],
  },
];

// Blocks are generated from the day's content so every day has the same rhythm.
export function getBlocks(day: CourseDay): CourseBlock[] {
  const [main, second, extra] = day.videos;
  return [
    ...(day.day > 1 ? [{ id: "review", kind: "review" as const, title: "Warm up: review yesterday's phrases", minutes: 15 }] : []),
    { id: "listen-1", kind: "listen", title: `Listen first: ${main.title}`, minutes: 25, videoId: main.id },
    { id: "phrases", kind: "phrases", title: "Learn today's 15 phrases", minutes: 20 },
    { id: "shadow-1", kind: "shadow", title: `Shadow: ${main.title}`, minutes: 40, videoId: main.id },
    { id: "listen-2", kind: "listen", title: `Listen first: ${second.title}`, minutes: 20, videoId: second.id },
    { id: "dictation-2", kind: "dictation", title: `Dictation: ${second.title}`, minutes: 20, videoId: second.id },
    { id: "speak", kind: "speak", title: "Speak: answer 5 questions out loud", minutes: 30 },
    { id: "extra", kind: "extra", title: `Bonus shadowing: ${extra.title}`, minutes: 40, videoId: extra.id, isOptional: true },
  ];
}

export function getCourseDay(dayNumber: number): CourseDay | undefined {
  return COURSE_DAYS.find((d) => d.day === dayNumber);
}
