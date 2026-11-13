// "Grammar & Words": the A2 grammar and everyday words, learned the comprehensible-input way. Each unit first
// shows its words as pictures, then tells a picture story that uses one pattern again and again, shows the
// pattern, plays it in real course videos, checks that it is understood (not drilled) and ends with saying it.
// The stories are written for this app and share one cast, so the pictures stay familiar from unit to unit.

export interface GrammarQuestion {
  question: string;
  // The right answer first; the check shuffles them.
  options: string[];
  // Shows this story line's picture with the question.
  picture?: number;
}

export interface GrammarWord {
  word: string;
  // In simple English, never translated.
  meaning: string;
  // Read aloud when the card is tapped.
  example: string;
  // What the picture shows (scripts/grammar-images).
  picture: string;
}

export interface StoryLine {
  text: string;
  picture: string;
}

export interface GrammarUnit {
  id: number;
  slug: string;
  title: string;
  // The everyday words the unit teaches alongside the grammar.
  topic: string;
  // What the learner can do after the unit, in plain words.
  canDo: string;
  words: GrammarWord[];
  story: { title: string; lines: StoryLine[] };
  // Shown in bold wherever they appear in the story.
  pattern: string[];
  explanation: string[];
  // Phrases searched for in Bob the Canadian and English Sponge transcripts.
  videoPhrases: string[];
  // About the story first, then about what the pattern means.
  check: GrammarQuestion[];
  speak: { shadow: string[]; prompts: string[] };
}

// How each person looks in every picture. A picture's {Name} is replaced with this.
export const GRAMMAR_CAST: Record<string, string> = {
  Mai: "a young Vietnamese woman with short black hair in a yellow sweater",
  Lan: "a Vietnamese teenage girl with a long black ponytail in a pink T-shirt",
  Nam: "a young Vietnamese man with round glasses in a blue shirt",
  Ben: "a tall young Australian man with short brown hair in a green T-shirt",
  Hoa: "a friendly Vietnamese woman in her thirties with her hair in a neat bun",
  Mum: "a Vietnamese mother in her fifties with shoulder-length hair in a green blouse",
  Dad: "a Vietnamese father in his fifties with short grey hair in a white shirt",
  Tom: "a middle-aged British tourist with a grey beard and a sun hat",
};

export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    id: 1,
    slug: "present-simple",
    title: "Every day: the present simple",
    topic: "Daily routine",
    canDo: "I can talk about my day and how often I do things.",
    words: [
      { word: "get up", meaning: "leave your bed in the morning", example: "I get up at six o'clock.", picture: "{Mai} getting out of bed in the morning, stretching." },
      { word: "have breakfast", meaning: "eat in the morning", example: "We have breakfast at seven.", picture: "A simple breakfast on a table: a bowl of noodle soup, a glass of water and chopsticks." },
      { word: "go to work", meaning: "travel to your job", example: "She goes to work by bike.", picture: "{Mai} riding a bicycle along a quiet street in the morning." },
      { word: "start work", meaning: "begin your job for the day", example: "I start work at half past seven.", picture: "{Mai} arriving at a hotel entrance, a big wall clock showing half past seven." },
      { word: "watch", meaning: "look at a video, a film or TV", example: "He watches videos after work.", picture: "{Mai} sitting on a sofa watching a video on her phone in the evening." },
      { word: "go to bed", meaning: "get into bed to sleep at night", example: "I usually go to bed at eleven.", picture: "A cosy bedroom at night with a bed, a small lamp and the moon in the window." },
    ],
    story: {
      title: "Mai's day",
      lines: [
        { text: "Mai works at a small hotel near the beach.", picture: "{Mai} smiling behind the reception desk of a small hotel, the sea visible through the door." },
        { text: "She always gets up at six o'clock.", picture: "{Mai} sitting up in bed, an alarm clock showing six o'clock on the bedside table, early morning light." },
        { text: "She usually has a glass of water and goes for a walk.", picture: "{Mai} walking on a beach path early in the morning, holding a bottle of water." },
        { text: "Her sister Lan never gets up early. She sleeps until eight.", picture: "{Lan} fast asleep in bed under a blanket, sunlight on the pillow, a clock showing eight o'clock." },
        { text: "Mai starts work at half past seven.", picture: "{Mai} walking into a small hotel, a big wall clock showing half past seven." },
        { text: "She answers the phone and helps the guests.", picture: "{Mai} at a hotel reception desk answering the phone and smiling at a tourist with a suitcase." },
        { text: "She doesn't drink coffee. She often drinks tea.", picture: "{Mai} holding a cup of green tea, with a cup of coffee pushed to the side of the table." },
        { text: "After work, she sometimes watches English videos on her phone.", picture: "{Mai} relaxing on a sofa in the evening, watching a video on her phone." },
      ],
    },
    pattern: ["works", "always gets up", "usually has", "goes", "never gets up", "sleeps", "starts", "answers", "helps", "doesn't drink", "often drinks", "sometimes watches"],
    explanation: [
      "Use the present simple for things you do again and again (every day, on Mondays) and things that are always true.",
      "With he, she and it, add -s: she works, he sleeps. Verbs ending in -ch, -sh or -o add -es: watches, goes. Have becomes has.",
      "Always, usually, often, sometimes and never say how often. Put them before the verb: She always gets up at six. After am, is and are: She is never late.",
      "For no, use don't or doesn't plus the plain verb: She doesn't drink coffee (not doesn't drinks).",
    ],
    videoPhrases: ["I usually", "every morning", "I always", "I never"],
    check: [
      { question: "What time does Mai get up?", options: ["At six o'clock", "At eight o'clock", "At half past seven", "At noon"] },
      { question: "Who never gets up early?", options: ["Lan", "Mai", "The guests", "Nobody"] },
      { question: "Look at the picture. What is true about Lan?", picture: 3, options: ["She never gets up early", "She always gets up at six", "She goes for a walk", "She works at a hotel"] },
      { question: "\"She always gets up at six.\" How often?", options: ["Every day", "Some days", "Never", "Only today"] },
      { question: "Which one is right?", options: ["She never gets up early.", "She gets never up early.", "Never she gets up early.", "She never get up early."] },
      { question: "Which one is right?", options: ["She doesn't drink coffee.", "She don't drink coffee.", "She doesn't drinks coffee.", "She not drink coffee."] },
    ],
    speak: {
      shadow: ["She always gets up at six o'clock.", "She doesn't drink coffee. She often drinks tea.", "After work, she sometimes watches English videos."],
      prompts: ["What do you usually do in the morning? Say three things, in order.", "Say one thing you always do, one you sometimes do and one you never do."],
    },
  },
  {
    id: 2,
    slug: "present-continuous",
    title: "Right now: the present continuous",
    topic: "At home",
    canDo: "I can say what people are doing at the moment.",
    words: [
      { word: "kitchen", meaning: "the room where you cook", example: "Mum is in the kitchen.", picture: "A bright, tidy home kitchen with a stove, pots and a window." },
      { word: "balcony", meaning: "a small open space outside a flat or house", example: "There are plants on the balcony.", picture: "A small balcony with green plants in pots and a city view." },
      { word: "sofa", meaning: "a long, soft seat for two or more people", example: "The cat is sleeping on the sofa.", picture: "A comfortable sofa with cushions in a living room." },
      { word: "cook", meaning: "make food hot and ready to eat", example: "Dad cooks on Sundays.", picture: "Hands stirring vegetables in a pan on a stove." },
      { word: "clean", meaning: "make something not dirty", example: "I'm cleaning my room.", picture: "{Mai} cleaning a desk with a cloth, a bucket on the floor." },
      { word: "homework", meaning: "work from school that you do at home", example: "Lan has a lot of homework.", picture: "A desk with open school books, a notebook and pencils." },
    ],
    story: {
      title: "A rainy Sunday at home",
      lines: [
        { text: "It's Sunday afternoon, and everyone is at home.", picture: "A cosy Vietnamese family home in the afternoon: {Mum}, {Dad}, {Mai} and {Lan} in different parts of the living room." },
        { text: "Mum is cooking dinner in the kitchen.", picture: "{Mum} cooking in a home kitchen, stirring a pot on the stove." },
        { text: "Dad is watering the plants on the balcony.", picture: "{Dad} watering green plants in pots on a small balcony." },
        { text: "Lan is lying on the sofa. She isn't doing her homework.", picture: "{Lan} lying on a sofa, her school books closed on the floor." },
        { text: "She's playing a game on her phone.", picture: "{Lan} on a sofa, smiling and playing a game on her phone." },
        { text: "Mai is cleaning her room and listening to music.", picture: "{Mai} cleaning her room with headphones on, dancing a little." },
        { text: "\"Lan, what are you doing?\" Mum asks. \"I'm studying!\" Lan says.", picture: "{Mum} in the kitchen doorway looking at {Lan}, who quickly hides her phone behind a book." },
        { text: "Now it's raining outside, and the cat is sleeping by the window.", picture: "A grey cat sleeping on a window seat, rain falling outside the window." },
      ],
    },
    pattern: ["is cooking", "is watering", "is lying", "isn't doing", "'s playing", "is cleaning", "listening", "are you doing", "'m studying", "'s raining", "is sleeping"],
    explanation: [
      "Use am / is / are + verb-ing for things happening now, at this moment: Mum is cooking. It's raining.",
      "Compare: Dad cooks on Sundays (a routine) and Mum is cooking now (at this moment).",
      "For no, add not: She isn't doing her homework. I'm not sleeping.",
      "Questions: What are you doing? Is it raining? Spelling: lie → lying, make → making, run → running.",
    ],
    videoPhrases: ["right now", "at the moment", "I'm standing", "I'm doing"],
    check: [
      { question: "Where is Mum?", options: ["In the kitchen", "On the balcony", "In Mai's room", "Outside"] },
      { question: "What is Lan really doing?", options: ["Playing a game on her phone", "Doing her homework", "Cleaning her room", "Cooking dinner"] },
      { question: "Look at the picture. What is Dad doing?", picture: 2, options: ["He's watering the plants", "He's cooking dinner", "He's sleeping", "He's playing a game"] },
      { question: "\"Lan is lying on the sofa.\" When?", options: ["Now, at this moment", "Every day", "Yesterday", "Next week"] },
      { question: "Which one is right?", options: ["Mum is cooking dinner.", "Mum cooking dinner.", "Mum is cook dinner.", "Mum are cooking dinner."] },
      { question: "Look outside! Which one is right?", options: ["It's raining.", "It rains now.", "It raining.", "It is rain."] },
    ],
    speak: {
      shadow: ["Mum is cooking dinner in the kitchen.", "She isn't doing her homework.", "It's raining, and the cat is sleeping."],
      prompts: ["What are you doing right now? What are people near you doing?", "Look out of the window. Say three things that are happening."],
    },
  },
  {
    id: 3,
    slug: "past-simple",
    title: "Telling a story: the past simple",
    topic: "Getting around",
    canDo: "I can tell what happened yesterday or last weekend.",
    words: [
      { word: "bus stop", meaning: "the place where you wait for a bus", example: "I ran to the bus stop.", picture: "A bus stop with a small roof and a bench on a city street." },
      { word: "umbrella", meaning: "you hold it over your head in the rain", example: "I didn't have an umbrella.", picture: "An open red umbrella with raindrops." },
      { word: "wallet", meaning: "a small bag for money and cards", example: "My wallet wasn't in my bag.", picture: "A brown leather wallet with some money and a card." },
      { word: "late", meaning: "after the right time", example: "He woke up late.", picture: "{Nam} running fast and looking at his watch, worried." },
      { word: "order", meaning: "ask for food or a drink in a cafe", example: "We ordered tea and cake.", picture: "A waiter writing down an order at a cafe table." },
      { word: "pay", meaning: "give money for something", example: "She paid for the cake.", picture: "A hand giving money to a cashier in a cafe." },
    ],
    story: {
      title: "Nam's bad Saturday",
      lines: [
        { text: "Last Saturday, Nam woke up late. His phone didn't ring.", picture: "{Nam} waking up in bed in a panic, his phone with a black screen next to him." },
        { text: "He jumped out of bed and ran to the bus stop.", picture: "{Nam} running down the street towards a bus stop." },
        { text: "The bus left one minute before he arrived.", picture: "{Nam} standing at a bus stop, watching a bus drive away." },
        { text: "Then it started to rain, and he didn't have an umbrella.", picture: "Lots of blue raindrops falling from a dark grey sky onto {Nam}, who walks along a street with his hair flat and wet and his shirt soaked, looking unhappy." },
        { text: "When he got to the cafe, Mai was already there.", picture: "{Mai} sitting at a cafe table, waving at {Nam}, who is wet at the door." },
        { text: "\"Did you sleep well?\" she asked. \"No, I didn't. I watched videos until two,\" he said.", picture: "{Nam} yawning at a cafe table while {Mai} asks him a question." },
        { text: "They ordered a tea, a coffee and a big piece of cake.", picture: "A cafe table with a cup of tea, a cup of coffee and a big piece of chocolate cake." },
        { text: "Then Nam looked for his wallet, but it wasn't in his bag. Mai laughed and paid.", picture: "{Nam} searching in his bag, worried, while {Mai} laughs and pays the waiter." },
      ],
    },
    pattern: ["woke up", "didn't ring", "jumped", "ran", "left", "arrived", "started", "didn't have", "got", "was", "Did you sleep", "asked", "didn't", "watched", "said", "ordered", "looked", "wasn't", "laughed", "paid"],
    explanation: [
      "Use the past simple for things that started and finished in the past: yesterday, last Saturday, two years ago.",
      "Many verbs add -ed: jumped, started, watched. Common verbs have their own form: wake → woke, run → ran, get → got, have → had, pay → paid.",
      "For no, use didn't plus the plain verb: He didn't have an umbrella (not didn't had).",
      "For questions, use did plus the plain verb: Did you sleep well? What did you do?",
    ],
    videoPhrases: ["yesterday I", "I went to", "I bought", "I didn't"],
    check: [
      { question: "Why was Nam late?", options: ["His phone didn't ring", "The bus was slow", "Mai called him late", "He was ill"] },
      { question: "Why didn't Nam sleep well?", options: ["He watched videos until two", "He was ill", "The rain was loud", "He worked late"] },
      { question: "Look at the picture. What happened?", picture: 2, options: ["The bus left before he arrived", "He got on the bus", "He drove to the cafe", "The bus was late"] },
      { question: "Who paid at the cafe?", options: ["Mai", "Nam", "They paid half each", "Nobody"] },
      { question: "Which one is right?", options: ["He didn't have an umbrella.", "He didn't had an umbrella.", "He don't had an umbrella.", "He not have an umbrella."] },
      { question: "What is the past of \"pay\"?", options: ["paid", "payed", "pay", "paying"] },
    ],
    speak: {
      shadow: ["Last Saturday, Nam woke up late.", "The bus left one minute before he arrived.", "Mai laughed and paid."],
      prompts: ["What did you do last weekend? Say four things, in order.", "Tell a short story about a bad day or a lucky day."],
    },
  },
  {
    id: 4,
    slug: "some-any-much-many",
    title: "How much? How many? some and any",
    topic: "Food and shopping",
    canDo: "I can shop for food, ask about prices and say how much I need.",
    words: [
      { word: "market", meaning: "a place with many small shops, often outside", example: "They go to the market.", picture: "A busy, colourful Vietnamese street market with fruit and vegetable stalls." },
      { word: "eggs", meaning: "chickens lay them; you can fry or boil them", example: "Do you have any eggs?", picture: "A small basket of brown eggs." },
      { word: "tomatoes", meaning: "red, round vegetables", example: "We need four tomatoes.", picture: "A pile of fresh red tomatoes." },
      { word: "rice", meaning: "small white grains you cook and eat", example: "We don't need much rice.", picture: "A bowl of cooked white rice next to a bag of rice." },
      { word: "mango", meaning: "a sweet yellow fruit", example: "How much are the mangoes?", picture: "Two ripe yellow mangoes, one cut open." },
      { word: "a kilo", meaning: "one thousand grams", example: "Can I have two kilos, please?", picture: "Fruit on an old weighing scale at a market stall." },
    ],
    story: {
      title: "Shopping for dinner",
      lines: [
        { text: "Mai and Ben are cooking dinner tonight, so they go to the market.", picture: "{Mai} and {Ben} walking into a busy street market with a shopping basket." },
        { text: "\"Do you have any eggs at home?\" Ben asks. \"No, I don't have any,\" says Mai.", picture: "{Ben} asking a question and {Mai} shaking her head at a market." },
        { text: "So they buy some eggs and some tomatoes.", picture: "{Mai} and {Ben} buying eggs and red tomatoes from a smiling market seller." },
        { text: "\"How many tomatoes do we need?\" \"Not many. Four is enough.\"", picture: "{Ben} holding four red tomatoes in his hands." },
        { text: "Ben wants some rice, but they don't need much. Mai has a big bag at home.", picture: "{Ben} pointing at big sacks of rice at a market stall while {Mai} smiles and shakes her head." },
        { text: "At the fruit stall, Mai asks, \"How much are the mangoes?\"", picture: "{Mai} pointing at yellow mangoes at a fruit stall, asking the seller." },
        { text: "\"Forty thousand dong a kilo.\" \"Can I have two kilos, please?\"", picture: "A market seller weighing yellow mangoes on a scale." },
        { text: "They don't have much money left, but they have lots of food.", picture: "{Mai} and {Ben} walking home happily, carrying full shopping bags of vegetables and fruit." },
      ],
    },
    pattern: ["any eggs", "don't have any", "some eggs", "some tomatoes", "How many tomatoes", "Not many", "some rice", "don't need much", "How much are", "much money", "lots of"],
    explanation: [
      "Use some in positive sentences (They buy some eggs) and any in questions and negatives (Do you have any eggs? I don't have any).",
      "Things you can count (eggs, tomatoes, mangoes) use many and How many…? Things you can't count (rice, money, water) use much and How much…?",
      "Ask the price with How much is…? or How much are…?: How much are the mangoes?",
      "Lots of and a lot of work with both: lots of food, a lot of tomatoes.",
    ],
    videoPhrases: ["how much", "a lot of", "do you have any", "how many"],
    check: [
      { question: "What do they buy first?", options: ["Eggs and tomatoes", "Rice", "Mangoes", "Coffee"] },
      { question: "How many tomatoes do they need?", options: ["Four", "Two", "Forty", "A lot"] },
      { question: "Why don't they need much rice?", options: ["Mai has a big bag at home", "Ben doesn't like rice", "Rice is expensive", "The market has no rice"] },
      { question: "Look at the picture. What is Mai asking?", picture: 5, options: ["The price of the mangoes", "Where the eggs are", "What time it is", "The seller's name"] },
      { question: "Which one is right?", options: ["How many eggs do we need?", "How much eggs do we need?", "How many rice do we need?", "How much egg we need?"] },
      { question: "Which one is right?", options: ["We don't need much rice.", "We don't need many rice.", "We need any rice.", "We don't need some rice."] },
    ],
    speak: {
      shadow: ["Do you have any eggs at home?", "How much are the mangoes?", "Can I have two kilos, please?"],
      prompts: ["You are at a market. Ask the price of two things and buy them.", "What food do you have at home now? Use some, any, much and many."],
    },
  },
  {
    id: 5,
    slug: "going-to-will",
    title: "Plans: going to and will",
    topic: "Travel and weekends",
    canDo: "I can talk about my plans and make quick decisions and offers.",
    words: [
      { word: "night bus", meaning: "a bus you travel on at night, with beds", example: "We're going to take the night bus.", picture: "A long sleeper bus on a road at night, its windows lit." },
      { word: "rent", meaning: "pay to use something for a short time", example: "They're going to rent bikes.", picture: "A row of bicycles for rent outside a small shop." },
      { word: "lake", meaning: "a large area of water with land around it", example: "We rode around the lake.", picture: "A calm lake with pine trees and hills around it." },
      { word: "flowers", meaning: "the colourful part of a plant", example: "Da Lat has lots of flowers.", picture: "A field of colourful flowers." },
      { word: "warm jacket", meaning: "a coat that keeps you warm", example: "I'll bring my warm jacket.", picture: "A thick, warm winter jacket on a hanger." },
      { word: "suitcase", meaning: "a bag for your clothes when you travel", example: "My suitcase is ready.", picture: "An open suitcase with folded clothes inside." },
    ],
    story: {
      title: "The trip to Da Lat",
      lines: [
        { text: "Next weekend, Mai and Lan are going to visit Da Lat.", picture: "{Mai} and {Lan} looking excitedly at a picture of pine hills and a lake on a laptop." },
        { text: "They're going to take the night bus on Friday.", picture: "A long sleeper bus waiting at a bus station at night, {Mai} and {Lan} with backpacks." },
        { text: "\"I'm not going to sleep on the bus,\" Lan says. \"I'm going to watch the stars.\"", picture: "{Lan} looking out of a bus window at a sky full of stars." },
        { text: "On Saturday, they're going to rent bikes and ride around the lake.", picture: "{Mai} and {Lan} riding bicycles beside a calm lake with pine trees." },
        { text: "Mai is going to take lots of photos of the flowers.", picture: "{Mai} taking photos of colourful flowers with her phone." },
        { text: "\"It's cold at night. I'll bring my warm jacket,\" Mai says.", picture: "{Mai} putting a thick warm jacket into a suitcase." },
        { text: "\"Look at those dark clouds. It's going to rain.\"", picture: "Dark grey clouds over green pine hills, {Lan} pointing at the sky." },
        { text: "\"Don't worry. I'll buy two umbrellas,\" Lan says.", picture: "{Lan} at a small shop, happily holding up two umbrellas." },
      ],
    },
    pattern: ["are going to visit", "'re going to take", "'m not going to sleep", "'m going to watch", "'re going to rent", "is going to take", "I'll bring", "'s going to rain", "I'll buy"],
    explanation: [
      "Use be going to + verb for plans you have already made: They're going to visit Da Lat next weekend.",
      "Also use it when you can see something is about to happen: Look at those clouds. It's going to rain.",
      "Use will ('ll) for a decision you make while you speak, and for offers: Don't worry, I'll buy umbrellas. I'll help you.",
      "In fast speech, going to often sounds like \"gonna\". You will hear it in videos.",
    ],
    videoPhrases: ["I'm going to", "we're going to", "are you going to", "I'll"],
    check: [
      { question: "How are Mai and Lan going to travel to Da Lat?", options: ["By night bus", "By plane", "By train", "By motorbike"] },
      { question: "What are they going to do on Saturday?", options: ["Rent bikes and ride around the lake", "Sleep all day", "Go shopping for jackets", "Take the bus home"] },
      { question: "Look at the picture. What is going to happen?", picture: 6, options: ["It's going to rain", "It's going to be sunny", "The bus is going to leave", "They're going to swim"] },
      { question: "\"They're going to rent bikes.\" What does this tell you?", options: ["It is a plan for the future", "It happened last week", "They do it every week", "They are doing it now"] },
      { question: "\"I'll buy two umbrellas,\" Lan says. When did she decide?", options: ["Just now, when she saw the clouds", "Last week", "Every year", "She didn't decide"] },
    ],
    speak: {
      shadow: ["Next weekend, we're going to visit Da Lat.", "Look at those dark clouds. It's going to rain.", "Don't worry. I'll buy two umbrellas."],
      prompts: ["What are you going to do this weekend? Say three plans.", "A friend says, \"I'm hungry.\" Offer to do something with I'll."],
    },
  },
  {
    id: 6,
    slug: "comparatives",
    title: "Bigger, better, the best: comparing",
    topic: "Places in town",
    canDo: "I can compare places and say which one I like best.",
    words: [
      { word: "flat", meaning: "rooms to live in, on one floor of a building", example: "His new flat is bigger.", picture: "A bright, small flat with a bed, a table and a big window." },
      { word: "neighbourhood", meaning: "the area around your home", example: "It's a quiet neighbourhood.", picture: "A friendly neighbourhood street with small houses, trees and shops." },
      { word: "corner", meaning: "where two streets meet", example: "The cafe on the corner is busy.", picture: "A cafe on a street corner where two roads meet." },
      { word: "busy", meaning: "with a lot of people or things happening", example: "The market is very busy.", picture: "A busy street full of people and motorbikes." },
      { word: "quiet", meaning: "with little noise", example: "The park is quieter than the street.", picture: "A quiet, peaceful park with a bench under a tree." },
      { word: "expensive", meaning: "it costs a lot of money", example: "The coffee there is expensive.", picture: "A very fancy cup of coffee with gold decoration on a small plate." },
    ],
    story: {
      title: "Ben's new neighbourhood",
      lines: [
        { text: "Ben moved to a new flat last month.", picture: "{Ben} carrying a big cardboard box into an apartment building." },
        { text: "His new flat is bigger than his old one, and it's cheaper too.", picture: "{Ben} standing happily in a large, bright, empty room with a big window." },
        { text: "But it's further from the city centre, so his trip to work is longer.", picture: "{Ben} sitting on a city bus in traffic, looking at his watch." },
        { text: "The park is the best place in the neighbourhood. It's quieter than the streets.", picture: "{Ben} jogging in a green, peaceful park with trees and a small lake." },
        { text: "The cafe on the corner is the busiest, but its coffee is the most expensive.", picture: "A crowded, stylish cafe on a street corner full of people." },
        { text: "The small cafe next to the market is better.", picture: "A small, simple cafe next to a market, with plastic stools and plants." },
        { text: "The coffee is cheaper, and the people are friendlier.", picture: "{Ben} drinking coffee and laughing with a friendly old cafe owner." },
        { text: "\"It isn't the most beautiful street in Hanoi,\" Ben says, \"but it's the happiest one for me.\"", picture: "{Ben} on a small balcony looking down at a busy street at sunset, smiling." },
      ],
    },
    pattern: ["bigger than", "cheaper", "further", "longer", "the best", "quieter than", "the busiest", "the most expensive", "better", "friendlier", "the most beautiful", "the happiest"],
    explanation: [
      "To compare two things, add -er + than to short words: big → bigger than, cheap → cheaper than. Words ending in -y change to -ier: busy → busier, friendly → friendlier.",
      "For the top one of a group, use the + -est: the cheapest, the busiest.",
      "Longer words use more and the most: more expensive, the most beautiful.",
      "Some words have their own forms: good → better → the best, bad → worse → the worst, far → further → the furthest.",
    ],
    videoPhrases: ["better than", "the best", "bigger than", "the most"],
    check: [
      { question: "Why is Ben's trip to work longer?", options: ["His flat is further from the centre", "He walks to work", "His bus is slower", "He works at night"] },
      { question: "Which cafe does Ben like best?", options: ["The small cafe next to the market", "The cafe on the corner", "The cafe in the park", "The cafe in the city centre"] },
      { question: "Look at the picture. What is this place like?", picture: 3, options: ["It's quieter than the streets", "It's the busiest place", "It's the most expensive", "It's further than the centre"] },
      { question: "\"His new flat is bigger than his old one.\" What does this mean?", options: ["The new flat has more space", "The old flat has more space", "Both flats are the same", "The new flat is cheaper"] },
      { question: "Which one is right?", options: ["The park is quieter than the streets.", "The park is more quieter than the streets.", "The park is quieter that the streets.", "The park is quiet than the streets."] },
      { question: "Which one is right?", options: ["This cafe is better than that one.", "This cafe is gooder than that one.", "This cafe is more good than that one.", "This cafe is best than that one."] },
    ],
    speak: {
      shadow: ["His new flat is bigger than his old one.", "The park is the best place in the neighbourhood.", "The coffee is cheaper, and the people are friendlier."],
      prompts: ["Compare your home now with an old home, or with a friend's home.", "What is the best place in your town? Why is it better than other places?"],
    },
  },
  {
    id: 7,
    slug: "can-could-have-to",
    title: "Asking and rules: can, could, have to",
    topic: "At a hotel",
    canDo: "I can ask for things politely and understand rules.",
    words: [
      { word: "check in", meaning: "tell a hotel you have arrived and get your room", example: "Can I check in, please?", picture: "A tourist with a suitcase at a hotel reception desk." },
      { word: "passport", meaning: "a small book you need to travel to other countries", example: "Could I see your passport?", picture: "A passport lying on a hotel desk." },
      { word: "room card", meaning: "a card that opens your hotel room", example: "You have to show your room card.", picture: "A plastic hotel key card next to a room door lock." },
      { word: "heavy", meaning: "hard to carry because it weighs a lot", example: "My bag is really heavy.", picture: "A huge, very full backpack on the floor." },
      { word: "breakfast", meaning: "the first meal of the day", example: "Breakfast is from six to nine.", picture: "A hotel breakfast table with bread, fruit, eggs and juice." },
      { word: "recommend", meaning: "say something is good, so someone tries it", example: "Could you recommend a restaurant?", picture: "A hotel receptionist pointing out of the window to a restaurant across the street." },
    ],
    story: {
      title: "At the hotel desk",
      lines: [
        { text: "Mai: Good evening. Welcome to the Sea View Hotel.", picture: "{Mai} smiling behind a hotel reception desk in the evening." },
        { text: "Tom: Hi. Can I check in, please?", picture: "{Tom} with a big backpack arriving at a hotel reception desk." },
        { text: "Mai: Of course. Could I see your passport, please?", picture: "{Tom} handing his passport across a hotel desk to {Mai}." },
        { text: "Tom: Here you are. Can I pay by card?", picture: "{Tom} holding up a bank card at a hotel desk." },
        { text: "Mai: Yes, you can. Breakfast is from six to nine. You have to show your room card.", picture: "A hotel breakfast room with food on a long table and a waiter at the door." },
        { text: "Tom: Could you help me with my bag? It's really heavy.", picture: "{Mai} in a hotel lobby, carrying a very big, heavy backpack with both arms and smiling." },
        { text: "Mai: Sure. You can't smoke in the rooms, and you have to leave by twelve on Sunday.", picture: "A hotel room door with a no-smoking symbol (a crossed-out cigarette)." },
        { text: "Tom: Could you recommend a good place for dinner?", picture: "{Tom} asking a question at the desk while {Mai} thinks." },
        { text: "Mai: The fish restaurant across the street is great. You don't have to book. You can just walk in.", picture: "A cosy seafood restaurant across a quiet street at night, its door open, a painted fish shape above the door." },
      ],
    },
    pattern: ["Can I check in", "Could I see", "Can I pay", "you can", "You have to show", "Could you help", "You can't smoke", "you have to leave", "Could you recommend", "You don't have to book", "You can just walk"],
    explanation: [
      "Can I + verb asks if you may do something: Can I pay by card? Could I + verb is a little more polite.",
      "Could you + verb asks someone to do something for you: Could you help me with my bag?",
      "Can says something is possible or allowed. Can't says it isn't: You can't smoke in the rooms.",
      "Have to says something is necessary, often a rule: You have to leave by twelve. Don't have to means it isn't necessary, but you can: You don't have to book.",
    ],
    videoPhrases: ["can I", "could you", "you have to", "I have to"],
    check: [
      { question: "What does Mai want to see?", options: ["Tom's passport", "Tom's ticket", "Tom's room card", "Tom's booking email"] },
      { question: "When does Tom have to leave the hotel?", options: ["By twelve on Sunday", "At nine in the morning", "Tonight", "Next week"] },
      { question: "Look at the picture. What is Tom asking for?", picture: 5, options: ["Help with his heavy bag", "A room with a sea view", "A taxi", "His passport"] },
      { question: "\"You don't have to book.\" What does this mean?", options: ["Booking isn't necessary", "You can't book", "You must book", "The restaurant is closed"] },
      { question: "\"You can't smoke in the rooms.\" What does this mean?", options: ["Smoking is not allowed", "Smoking is not necessary", "You don't know how to smoke", "You can smoke later"] },
      { question: "Which is the most polite way to ask?", options: ["Could you recommend a restaurant?", "Recommend a restaurant.", "You recommend a restaurant.", "I want a restaurant."] },
    ],
    speak: {
      shadow: ["Can I pay by card?", "Could you help me with my bag?", "You don't have to book. You can just walk in."],
      prompts: ["You are at a hotel. Ask for two things politely, using can I and could you.", "Say two rules at your school or work, using have to and can't."],
    },
  },
  {
    id: 8,
    slug: "questions",
    title: "Keeping a chat going: questions",
    topic: "Meeting people",
    canDo: "I can ask questions to start and keep a conversation going.",
    words: [
      { word: "class", meaning: "a group of people learning together", example: "It's my first class.", picture: "A small cooking class with people at kitchen tables." },
      { word: "apron", meaning: "you wear it over your clothes when you cook", example: "Put on your apron.", picture: "A red cooking apron hanging on a hook." },
      { word: "nurse", meaning: "a person who looks after ill people in a hospital", example: "Hoa is a nurse.", picture: "{Hoa} in a light blue nurse uniform in a hospital corridor." },
      { word: "company", meaning: "a business where people work", example: "My company sent me here.", picture: "A modern office with people working at computers." },
      { word: "move", meaning: "go to live in a new place", example: "I moved to Hanoi in May.", picture: "Cardboard moving boxes in an empty room." },
      { word: "spring rolls", meaning: "rice paper rolled around meat and vegetables", example: "We're making spring rolls.", picture: "A plate of fresh Vietnamese spring rolls in rice paper with green herbs, and a small bowl of dipping sauce." },
    ],
    story: {
      title: "A new classmate",
      lines: [
        { text: "Hoa: Hi! Are you new here? I'm Hoa.", picture: "{Hoa} in a red apron greeting {Ben} at a cooking class." },
        { text: "Ben: Yes, it's my first class. I'm Ben.", picture: "{Ben} in an apron waving hello in a cooking class kitchen." },
        { text: "Hoa: Nice to meet you, Ben. Where are you from?", picture: "{Hoa} and {Ben} shaking hands in a cooking class." },
        { text: "Ben: I'm from Australia. I moved to Hanoi in May.", picture: "{Ben} talking happily, a thought bubble above him showing a kangaroo and a beach." },
        { text: "Hoa: Why did you come to Vietnam?", picture: "{Hoa} asking a question with interest while chopping vegetables." },
        { text: "Ben: My company sent me. What do you do, Hoa?", picture: "{Ben} chopping vegetables and asking a question." },
        { text: "Hoa: I'm a nurse. Do you like Vietnamese food?", picture: "{Hoa} smiling, a thought bubble above her showing her in a nurse uniform at a hospital." },
        { text: "Ben: I love it! What are we cooking today?", picture: "{Ben} and {Hoa} rolling fresh spring rolls together at a kitchen table." },
      ],
    },
    pattern: ["Are you new", "Where are you from", "Why did you come", "What do you do", "Do you like", "What are we cooking"],
    explanation: [
      "Most questions start with a small helping word, then the person, then the verb: Do you like it? Did you come? Are you new?",
      "Put a question word first for more information: Where are you from? What do you do? Why did you come?",
      "With be, just swap the order: You are new → Are you new?",
      "Asking a question back (\"What do you do, Hoa?\") is how you keep a conversation going.",
    ],
    videoPhrases: ["what do you", "do you have", "where did you", "do you like"],
    check: [
      { question: "Where is Ben from?", options: ["Australia", "England", "Canada", "Vietnam"] },
      { question: "Why did Ben come to Vietnam?", options: ["His company sent him", "He wanted to study", "He is on holiday", "He wanted to cook"] },
      { question: "What is Hoa's job?", options: ["She's a nurse", "She's a teacher", "She's a cook", "She works for Ben's company"] },
      { question: "Look at the picture. Where are they?", picture: 0, options: ["At a cooking class", "In a hospital", "At a hotel", "At the market"] },
      { question: "Which question asks about someone's job?", options: ["What do you do?", "How do you do?", "What are you doing now?", "Where do you do?"] },
      { question: "Which one is right?", options: ["Why did you come to Vietnam?", "Why you came to Vietnam?", "Why did you came to Vietnam?", "Why you did come to Vietnam?"] },
    ],
    speak: {
      shadow: ["Nice to meet you. Where are you from?", "Why did you come to Vietnam?", "What do you do?"],
      prompts: ["You meet someone new. Ask them four questions.", "Answer Hoa's questions about yourself: where are you from, what do you do, do you like your city?"],
    },
  },
  {
    id: 9,
    slug: "should",
    title: "Giving advice: should",
    topic: "Health",
    canDo: "I can say how I feel and give and ask for advice.",
    words: [
      { word: "headache", meaning: "a pain in your head", example: "I have a headache.", picture: "{Nam} holding his head with both hands, in pain." },
      { word: "sore throat", meaning: "your throat hurts when you speak or eat", example: "He has a sore throat.", picture: "{Nam} with a scarf around his neck, touching his throat." },
      { word: "fever", meaning: "your body is too hot because you are ill", example: "If you have a fever, see a doctor.", picture: "A thermometer showing a high temperature." },
      { word: "rest", meaning: "stop and relax so your body gets better", example: "You should rest.", picture: "{Nam} resting in bed under a blanket." },
      { word: "medicine", meaning: "something you take to get better", example: "Take this medicine after lunch.", picture: "A box of medicine and a glass of water on a table." },
      { word: "doctor", meaning: "a person who helps you when you are ill", example: "You should see a doctor.", picture: "A kind doctor with a stethoscope in a clinic." },
    ],
    story: {
      title: "Nam doesn't feel well",
      lines: [
        { text: "Nam doesn't feel well today. He has a headache and a sore throat.", picture: "{Nam} sitting on his bed, holding his head, with a scarf around his neck." },
        { text: "He calls his friend Hoa. She's a nurse.", picture: "{Nam} on the phone at home; {Hoa} in a light blue nurse uniform talking on the phone at a hospital." },
        { text: "\"You should stay at home and rest,\" Hoa says.", picture: "{Nam} lying in bed under a blanket, resting." },
        { text: "\"You should drink lots of warm water.\"", picture: "{Nam} in bed drinking a glass of warm water." },
        { text: "\"And you shouldn't look at your phone all night.\"", picture: "{Nam} in bed in the dark at night, his tired face lit by his phone." },
        { text: "\"Should I go to work tomorrow?\" Nam asks.", picture: "{Nam} on the phone, looking worried, his work bag by the door." },
        { text: "\"No, you shouldn't. If you have a fever, you should see a doctor.\"", picture: "A thermometer and a box of medicine on a bedside table." },
        { text: "Two days later, Nam feels much better. He takes Hoa a box of cakes to say thank you.", picture: "{Nam}, healthy and smiling, giving a box of cakes to {Hoa}." },
      ],
    },
    pattern: ["should stay", "should drink", "shouldn't look", "Should I go", "you shouldn't", "should see"],
    explanation: [
      "Use should + verb to give advice, to say something is a good idea: You should rest.",
      "Shouldn't says something is a bad idea: You shouldn't look at your phone all night.",
      "Ask for advice with Should I…?: Should I go to work? Should I see a doctor?",
      "Talk about how you feel: I don't feel well. I have a headache. I feel better.",
    ],
    videoPhrases: ["you should", "I think you should", "you shouldn't", "should I"],
    check: [
      { question: "What's wrong with Nam?", options: ["He has a headache and a sore throat", "He broke his leg", "He is very tired from work", "He has a stomach ache"] },
      { question: "What should Nam drink?", options: ["Lots of warm water", "Coffee", "Cold juice", "Nothing"] },
      { question: "Look at the picture. What shouldn't Nam do?", picture: 4, options: ["Look at his phone all night", "Drink warm water", "Stay in bed", "Call Hoa"] },
      { question: "When should Nam see a doctor?", options: ["If he has a fever", "Every day", "Never", "After work"] },
      { question: "\"You should rest.\" What is Hoa doing?", options: ["Giving advice", "Giving an order", "Talking about the past", "Saying a rule"] },
      { question: "Which one is right?", options: ["You shouldn't go to work.", "You don't should go to work.", "You shouldn't to go to work.", "You not should go to work."] },
    ],
    speak: {
      shadow: ["You should stay at home and rest.", "Should I go to work tomorrow?", "If you have a fever, you should see a doctor."],
      prompts: ["A friend has a headache. Give them three pieces of advice.", "What should people do to stay healthy? Say three things."],
    },
  },
  {
    id: 10,
    slug: "present-perfect",
    title: "Life experiences: have you ever…?",
    topic: "Travel and experiences",
    canDo: "I can talk about things I have or haven't done in my life.",
    words: [
      { word: "travel", meaning: "go to other places or countries", example: "Ben has travelled a lot.", picture: "A backpacker looking at a big map with a globe beside him." },
      { word: "snow", meaning: "soft white ice that falls from the sky when it's very cold", example: "Have you ever seen snow?", picture: "A snowy street with snow falling and snow on the trees." },
      { word: "swim", meaning: "move through water with your arms and legs", example: "He has swum in the sea.", picture: "A happy young man swimming in a clear blue sea, seen up close, splashing water." },
      { word: "plane", meaning: "it flies people from one place to another", example: "Have you ever been on a plane?", picture: "A plane flying in a blue sky above the clouds." },
      { word: "pizza", meaning: "a flat Italian bread with cheese and tomato", example: "I've made pizza at home.", picture: "A round pizza with cheese and tomato on a wooden board." },
      { word: "books", meaning: "you read them; they have pages", example: "Nam has read three hundred books.", picture: "Tall piles of books on a wooden shelf." },
    ],
    story: {
      title: "Two friends, two lives",
      lines: [
        { text: "Ben has travelled to nine countries.", picture: "{Ben} with a big backpack standing next to a globe." },
        { text: "He has seen snow in Japan, and he has swum in the sea in Thailand.", picture: "{Ben} standing in a snowy Japanese street with a red temple gate, snow falling." },
        { text: "His friend Nam has never been on a long trip. He has lived in Hanoi all his life.", picture: "{Nam} walking down a narrow street in old Hanoi with small shops and motorbikes." },
        { text: "But Nam has read more than three hundred books.", picture: "{Nam} sitting happily among tall piles of books in his room." },
        { text: "\"Have you ever eaten real Italian pizza?\" Ben asks.", picture: "{Ben} and {Nam} talking at a small table in a cafe." },
        { text: "\"No, I haven't,\" Nam says. \"But I've made it fifty times at home.\"", picture: "{Nam} taking a homemade pizza out of an oven in his kitchen." },
        { text: "\"Have you ever been on a plane?\" \"Yes, once. I flew to Da Nang in 2019.\"", picture: "A plane flying over a long sunny beach with blue sea." },
        { text: "Ben smiles. \"You've seen the world in your books, and I've seen it from a window.\"", picture: "{Ben} looking out of a plane window at the clouds, and {Nam} reading a book on a sofa." },
      ],
    },
    pattern: ["has travelled", "has seen", "has swum", "has never been", "has lived", "has read", "Have you ever eaten", "I haven't", "I've made", "Have you ever been", "You've seen", "I've seen"],
    explanation: [
      "Use have / has + past participle for experiences in your life, when the exact time is not important: I've been to Japan. Nam has read 300 books.",
      "Ever means \"at any time in your life\": Have you ever eaten pizza? Never means \"not at any time\": He has never been on a long trip.",
      "When you say the exact time, use the past simple: I flew to Da Nang in 2019 (not I have flown in 2019).",
      "In speech, have and has are short: I've, you've, he's, we've.",
    ],
    videoPhrases: ["I've never", "have you ever", "I've been", "I have always"],
    check: [
      { question: "How many countries has Ben travelled to?", options: ["Nine", "Three", "Fifty", "None"] },
      { question: "How has Nam \"seen the world\"?", options: ["In his books", "On many trips", "From a plane window", "In films"] },
      { question: "Look at the picture. What has Nam done?", picture: 3, options: ["He has read hundreds of books", "He has travelled to nine countries", "He has seen snow", "He has swum in the sea"] },
      { question: "When did Nam fly to Da Nang?", options: ["In 2019", "Last week", "He has never flown", "Next year"] },
      { question: "\"He has never been on a long trip.\" What does this mean?", options: ["Not at any time in his life", "Not yesterday", "Not now, but tomorrow", "He doesn't like trips"] },
      { question: "Which one is right?", options: ["I flew there in 2019.", "I have flown there in 2019.", "I have fly there in 2019.", "I've flew there in 2019."] },
    ],
    speak: {
      shadow: ["He has never been on a long trip.", "Have you ever eaten real Italian pizza?", "No, I haven't. But I've made it at home."],
      prompts: ["Say three things you have done in your life, and one thing you've never done.", "Ask a friend two \"Have you ever…?\" questions, then answer them yourself."],
    },
  },
];

// The pictures are in public/grammar/<unit slug>/, made by scripts/grammar-images/generate.mts.
export const getStoryPicture = (unit: GrammarUnit, index: number) => `/grammar/${unit.slug}/story-${index + 1}.webp`;
export const getWordPicture = (unit: GrammarUnit, word: GrammarWord) => `/grammar/${unit.slug}/word-${word.word.toLowerCase().replace(/[^a-z]+/g, "-")}.webp`;

// What the narration reads, line by line: the story (a dialogue's "Name:" becomes its speaker, so each person
// gets a voice), then the lines to shadow, then the words' examples. scripts/story-audio narrates it with the
// daily stories.
export interface NarrationLine {
  speaker: string | null;
  text: string;
}

export const getGrammarNarrationId = (unit: GrammarUnit) => `grammar-${unit.slug}`;

export function splitSpeaker(line: string): NarrationLine {
  const match = line.match(/^([A-Z][A-Za-z]+): (.+)$/);
  return match ? { speaker: match[1], text: match[2] } : { speaker: null, text: line };
}

export function getGrammarNarration(unit: GrammarUnit): NarrationLine[] {
  return [
    ...unit.story.lines.map((line) => splitSpeaker(line.text)),
    ...unit.speak.shadow.map((text) => ({ speaker: null, text })),
    ...unit.words.map((word) => ({ speaker: null, text: word.example })),
  ];
}

export function getGrammarUnit(slug: string): GrammarUnit | undefined {
  return GRAMMAR_UNITS.find((unit) => unit.slug === slug);
}

// A new id for the A2 units, so ticks from the earlier units don't land on different ones.
export const GRAMMAR_COURSE_ID = "grammar-a2";
