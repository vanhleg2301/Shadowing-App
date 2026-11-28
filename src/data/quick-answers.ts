// Quick answers: everyday questions to answer out loud, fast, about yourself. One set per video topic (TOPICS in
// curated.ts), so a course day asks about what its video talked about. Each question has a short model answer at
// A2-B1. The questions and answers are narrated with Kokoro like the daily stories (scripts/story-audio).
import { TOPICS } from "./curated";

export interface QuickQuestion {
  question: string;
  answer: string;
}

export interface QuickTopic {
  // The video topic it belongs to, as in TOPICS.
  topic: (typeof TOPICS)[number];
  slug: string;
  questions: QuickQuestion[];
}

export const QUICK_TOPICS: QuickTopic[] = [
  {
    topic: "Talking About Yourself",
    slug: "yourself",
    questions: [
      { question: "What's your name, and where are you from?", answer: "My name is Lan, and I'm from Da Nang, in the middle of Vietnam." },
      { question: "What do you do?", answer: "I work in an office. I'm an accountant, so I work with numbers all day." },
      { question: "How old were you when you started learning English?", answer: "I started at school when I was about ten, but I only really started speaking last year." },
      { question: "What do you like doing in your free time?", answer: "I like watching films and going for walks. On weekends I sometimes go swimming." },
      { question: "Are you a morning person or a night person?", answer: "I'm a night person. I find it hard to get up early, but I'm full of energy at night." },
      { question: "What's something you're good at?", answer: "I'm good at cooking. My friends always ask me to make spring rolls." },
      { question: "Why are you learning English?", answer: "I want to use it at work, and I'd love to travel and talk to people from other countries." },
      { question: "How would your friends describe you?", answer: "They would say I'm friendly and a bit quiet, but funny when you know me." },
      { question: "What's one thing you want to do this year?", answer: "I want to speak English with confidence, and I'd like to visit Japan." },
      { question: "Tell me about a typical weekend for you.", answer: "On Saturday I clean the house and see my friends. On Sunday I relax and visit my parents." },
    ],
  },
  {
    topic: "Family & Friends",
    slug: "family-and-friends",
    questions: [
      { question: "How many people are there in your family?", answer: "There are four of us: my parents, my younger brother and me." },
      { question: "Who are you closest to in your family?", answer: "I'm closest to my mum. I tell her everything." },
      { question: "Do you live with your family?", answer: "Yes, I still live with my parents. It's cheaper, and I like having dinner together." },
      { question: "What does your best friend do?", answer: "My best friend is a nurse. She works long hours at a hospital." },
      { question: "How did you meet your best friend?", answer: "We met at university. We were in the same class and sat next to each other." },
      { question: "What do you usually do with your friends?", answer: "We usually go out for coffee or dinner, and sometimes we go to the cinema." },
      { question: "Do you have any brothers or sisters?", answer: "I have one younger brother. He's twenty and he's still at university." },
      { question: "Who do you look like in your family?", answer: "People say I look like my dad. We have the same eyes and smile." },
      { question: "When does your whole family get together?", answer: "We all get together at Tet, and sometimes for birthdays." },
      { question: "What's a good thing about having friends from different places?", answer: "You learn new things. My friend from Hanoi taught me a lot about northern food." },
    ],
  },
  {
    topic: "Home & Routine",
    slug: "home-and-routine",
    questions: [
      { question: "What time do you usually get up?", answer: "I usually get up at about half past six, but on weekends I sleep until eight." },
      { question: "What's the first thing you do in the morning?", answer: "The first thing I do is check my phone. Then I have a shower and make coffee." },
      { question: "What do you usually have for breakfast?", answer: "I usually have bread and an egg, or a bowl of pho if I have time." },
      { question: "How do you get to work or school?", answer: "I go by motorbike. It takes about twenty minutes." },
      { question: "What do you do after work?", answer: "After work I go to the gym or cook dinner, and then I watch something on TV." },
      { question: "Describe your home.", answer: "I live in a small flat with two bedrooms. It's quite old, but it's bright and quiet." },
      { question: "What's your favourite room at home, and why?", answer: "My favourite room is my bedroom, because it's quiet and I can read there." },
      { question: "Which housework do you hate?", answer: "I hate ironing. It takes so long, and the clothes always look the same afterwards." },
      { question: "What time do you go to bed?", answer: "I go to bed at around eleven, but I often read for a bit first." },
      { question: "What did you do yesterday evening?", answer: "Yesterday evening I cooked dinner, called my sister and watched a film." },
    ],
  },
  {
    topic: "Food & Drink",
    slug: "food-and-drink",
    questions: [
      { question: "What's your favourite food?", answer: "My favourite food is bun cha. I love the grilled pork and the sauce." },
      { question: "Do you like cooking?", answer: "Yes, I do. I cook most evenings, but only simple things." },
      { question: "What did you have for lunch today?", answer: "I had rice with chicken and some vegetables from a place near my office." },
      { question: "How do you take your coffee?", answer: "I take it with condensed milk and lots of ice, the Vietnamese way." },
      { question: "Is there any food you don't like?", answer: "I don't like very spicy food. It hurts my stomach." },
      { question: "Do you prefer eating at home or eating out?", answer: "I prefer eating at home. It's cheaper and healthier, but eating out is nice on weekends." },
      { question: "What's a good dish from your hometown?", answer: "In my hometown we have mi Quang. It's a noodle dish with a little broth." },
      { question: "What do you usually order at a restaurant?", answer: "I usually order fish or a salad, and a fresh juice." },
      { question: "Do you eat breakfast every day?", answer: "Not every day. When I'm in a hurry, I just have a coffee." },
      { question: "What would you cook for a friend from another country?", answer: "I would cook spring rolls, because they're easy to share and everyone likes them." },
    ],
  },
  {
    topic: "Shopping & Services",
    slug: "shopping-and-services",
    questions: [
      { question: "Do you like shopping?", answer: "Not really. I only go shopping when I need something." },
      { question: "Do you prefer shopping online or in shops?", answer: "I prefer shopping online. It's faster, and I can compare prices." },
      { question: "What was the last thing you bought?", answer: "The last thing I bought was a pair of running shoes." },
      { question: "Where do you buy your food?", answer: "I buy most of my food at the market near my house, and some at the supermarket." },
      { question: "Have you ever returned something to a shop?", answer: "Yes, once. I bought a shirt, but it was too small, so I changed it for a bigger one." },
      { question: "How often do you get your hair cut?", answer: "I get it cut about once a month, at a small place on my street." },
      { question: "What do you say when something is too expensive?", answer: "I ask if they can give me a better price. Sometimes it works." },
      { question: "What's a shop you really like?", answer: "I like a small bookshop in the city centre. It's quiet and the staff are friendly." },
      { question: "Do you compare prices before you buy?", answer: "Yes, always, especially for expensive things like phones." },
      { question: "What would you like to buy next?", answer: "I'd like to buy a new laptop. Mine is very slow now." },
    ],
  },
  {
    topic: "Getting Around",
    slug: "getting-around",
    questions: [
      { question: "How do you usually get around your city?", answer: "I usually get around by motorbike. It's the fastest way here." },
      { question: "Is public transport good where you live?", answer: "It's getting better. There are more buses now, but they can be slow." },
      { question: "How long does it take you to get to work?", answer: "It takes me about thirty minutes, or longer when the traffic is bad." },
      { question: "Can you drive a car?", answer: "No, I can't, but I'd like to learn next year." },
      { question: "How would you tell someone the way to your home?", answer: "Go straight down the main road, turn left at the market, and it's the third house on the right." },
      { question: "Have you ever got lost?", answer: "Yes, in a new city last year. I asked a shop owner and she showed me the way." },
      { question: "What's the traffic like in your city?", answer: "It's very busy in the morning and evening. Everyone is in a hurry." },
      { question: "Do you prefer taxis or buses?", answer: "I prefer buses because they're cheap, but I take a taxi when it rains." },
      { question: "Do you walk much every day?", answer: "Not much. I walk to the coffee shop and back, and that's about it." },
      { question: "What's the best way to travel around your country?", answer: "I think the train is the best way. It's slow, but you see a lot." },
    ],
  },
  {
    topic: "Health",
    slug: "health",
    questions: [
      { question: "What do you do to stay healthy?", answer: "I try to walk every day, and I don't eat much sugar." },
      { question: "How do you feel today?", answer: "I feel fine, thanks, just a bit tired because I slept late." },
      { question: "When were you last ill?", answer: "I had a bad cold last month. I stayed at home for two days." },
      { question: "What do you do when you have a headache?", answer: "I drink some water and lie down for a while. If it doesn't stop, I take something." },
      { question: "How many hours do you sleep?", answer: "I sleep about seven hours, but I'd like to sleep more." },
      { question: "Do you do any sport?", answer: "Yes, I play badminton with my friends twice a week." },
      { question: "How do you relax when you're stressed?", answer: "I listen to music or go for a walk. It helps me think clearly." },
      { question: "When did you last see a doctor?", answer: "I saw a doctor in the spring for a check-up. Everything was fine." },
      { question: "Is there something unhealthy you'd like to stop doing?", answer: "I'd like to stop using my phone in bed. I sleep badly because of it." },
      { question: "What advice would you give a friend with a cold?", answer: "Drink lots of warm water, eat some soup and get plenty of rest." },
    ],
  },
  {
    topic: "Free Time",
    slug: "free-time",
    questions: [
      { question: "What do you do to relax?", answer: "I watch videos, read or go for a coffee with a friend." },
      { question: "Do you have a hobby?", answer: "Yes, I like taking photos, especially of old buildings." },
      { question: "What kind of music do you like?", answer: "I like pop music and some old Vietnamese songs my parents listen to." },
      { question: "What's a good film you've seen recently?", answer: "I saw a funny film about a family on holiday. I laughed a lot." },
      { question: "What did you do last weekend?", answer: "Last weekend I went to the beach with my friends and we had seafood." },
      { question: "Do you prefer staying in or going out?", answer: "I prefer staying in during the week and going out on weekends." },
      { question: "How much time do you spend on your phone?", answer: "Too much! Probably three or four hours a day." },
      { question: "Is there a new hobby you'd like to try?", answer: "I'd like to try playing the guitar. It looks fun." },
      { question: "What do you like reading?", answer: "I like short stories and articles about travel." },
      { question: "What are you going to do this weekend?", answer: "I'm going to visit my grandparents and help them in the garden." },
    ],
  },
  {
    topic: "Weather & Outdoors",
    slug: "weather-and-outdoors",
    questions: [
      { question: "What's the weather like today?", answer: "It's hot and sunny today, but it might rain this afternoon." },
      { question: "What's your favourite season?", answer: "I like autumn best. It's cool and the sky is clear." },
      { question: "What do you do on a rainy day?", answer: "I stay at home, drink tea and watch a film." },
      { question: "Do you like hot or cold weather?", answer: "I prefer cool weather. When it's too hot, I feel tired." },
      { question: "What's the weather like in your hometown?", answer: "It's warm most of the year, with a rainy season in autumn." },
      { question: "Do you spend much time outside?", answer: "Not as much as I'd like. I'm inside at work all day." },
      { question: "Where do you like going for a walk?", answer: "I like walking by the river in the evening, when it's cooler." },
      { question: "Have you ever seen snow?", answer: "No, never. I'd love to see it one day." },
      { question: "What do you wear when it's very hot?", answer: "I wear light clothes, a hat and sunglasses." },
      { question: "What do you like doing at the beach?", answer: "I like swimming in the morning and eating seafood in the evening." },
    ],
  },
  {
    topic: "Work",
    slug: "work",
    questions: [
      { question: "What's your job?", answer: "I'm a sales assistant in a phone shop." },
      { question: "What do you like about your job?", answer: "I like talking to customers, and my colleagues are very nice." },
      { question: "What don't you like about your job?", answer: "Sometimes I have to work late, and that's tiring." },
      { question: "What time do you start and finish work?", answer: "I start at eight and finish at five, with an hour for lunch." },
      { question: "What did you do at work yesterday?", answer: "Yesterday I had two meetings and answered a lot of emails." },
      { question: "Do you work from home sometimes?", answer: "Yes, on Fridays. I like it because I don't have to travel." },
      { question: "What job did you want when you were a child?", answer: "I wanted to be a pilot. I loved planes." },
      { question: "Do you use English at work?", answer: "A little. I write emails in English and sometimes talk to foreign customers." },
      { question: "What would be your dream job?", answer: "My dream job would be a travel writer. I could see the world and get paid for it." },
      { question: "How do you introduce yourself at a meeting?", answer: "Hi, I'm Minh. I work in the marketing team, and I look after our social media." },
    ],
  },
  {
    topic: "Travel",
    slug: "travel",
    questions: [
      { question: "Where did you go on your last holiday?", answer: "I went to Hoi An with my family. We walked around the old town every evening." },
      { question: "Do you prefer the beach or the mountains?", answer: "I prefer the mountains. It's cooler and quieter." },
      { question: "Where would you like to travel next?", answer: "I'd like to go to Korea. I want to see Seoul and try the food." },
      { question: "What do you always pack?", answer: "I always pack my phone charger, a jacket and some medicine." },
      { question: "Have you ever been abroad?", answer: "Yes, once. I went to Thailand two years ago." },
      { question: "Do you like travelling alone or with others?", answer: "I like travelling with friends. It's more fun to share things." },
      { question: "What's the best place you've ever visited?", answer: "The best place was Ha Long Bay. The view from the boat was amazing." },
      { question: "How do you plan a trip?", answer: "I look for cheap flights first, then I find a hotel near the centre." },
      { question: "What do you do if you get lost in a new city?", answer: "I look at the map on my phone, or I ask someone at a shop." },
      { question: "What would you tell a visitor to see in your country?", answer: "Go to the north for the mountains and to the centre for the old towns and beaches." },
    ],
  },
  {
    topic: "Everyday Words",
    slug: "everyday",
    questions: [
      { question: "How's your day going?", answer: "Pretty good, thanks. It's been busy, but I'm nearly done." },
      { question: "What are you doing later today?", answer: "Later I'm going to meet a friend for dinner." },
      { question: "What's the best thing that happened to you this week?", answer: "I finished a big project at work, and my boss was happy with it." },
      { question: "What's something that made you laugh recently?", answer: "My little nephew tried to speak English and said everything was delicious." },
      { question: "What's on your mind today?", answer: "I'm thinking about my weekend. I want to go somewhere new." },
      { question: "Can you describe the room you're in now?", answer: "I'm in my bedroom. There's a bed, a desk and a window with a small plant." },
      { question: "What did you do this morning?", answer: "This morning I had breakfast, went to work and answered some messages." },
      { question: "What's something you can't live without?", answer: "I can't live without coffee. I need it every morning." },
      { question: "How do you say thank you when someone helps you?", answer: "Thank you so much, that's really kind of you." },
      { question: "What's a small thing that makes you happy?", answer: "A good cup of coffee on a quiet morning makes me happy." },
    ],
  },
];

export const QUICK_SESSION_SIZE = 8;

export function getQuickTopic(slug: string): QuickTopic | undefined {
  return QUICK_TOPICS.find((t) => t.slug === slug);
}

export function getQuickTopicFor(topic: string | undefined): QuickTopic {
  return QUICK_TOPICS.find((t) => t.topic === topic) ?? QUICK_TOPICS[0];
}

// What is narrated, question then answer, one line each: line 2i is question i, 2i+1 its answer.
export function getQuickNarrationId(topic: QuickTopic): string {
  return `quick-${topic.slug}`;
}

export function getQuickNarration(topic: QuickTopic): string[] {
  return topic.questions.flatMap((q) => [q.question, q.answer]);
}
