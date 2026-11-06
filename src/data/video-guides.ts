// Hand-written guides for course videos: what the video covers, in the order it says it, with lines taken word
// for word from the transcript, a model to copy, and questions for the day test. Written by reading each
// transcript, so they cost nothing to run; days without a guide still have their words, sentences and test.

export interface GuideQuestion {
  question: string;
  // The right answer first; the test shuffles them.
  options: string[];
}

export interface GuideSection {
  title: string;
  // Exactly as they are said in the video (matched against the transcript, so they can be played).
  lines: string[];
}

export interface VideoGuide {
  overview: string;
  sections: GuideSection[];
  // A short text to learn and adapt, built from the video's own lines; [brackets] mark what to change.
  model: { title: string; text: string };
  questions: GuideQuestion[];
}

export const VIDEO_GUIDES: Record<string, VideoGuide> = {
  // Bob the Canadian, week 1
  ovl9kM46r10: {
    overview:
      "Bob shares about ten things you might not know about him. After each one he gives the sentence pattern for talking about yourself: what you are afraid of, your family, what you don't like and prefer, where you were born and grew up, what you love, what you used to do, your hobbies and a country you want to visit.",
    sections: [
      { title: "Things you are afraid of", lines: ["I'm afraid of heights.", "I could also say I'm scared of heights.", "I'm afraid of spiders"] },
      { title: "Your family", lines: ["I'm a middle child.", "I have an older brother and I have an older sister.", "I have two brothers and two sisters"] },
      { title: "What you don't like, and what you prefer", lines: ["I don't really like American television shows.", "I prefer television shows from Britain or from France.", "I don't like hotdogs, I prefer hamburgers"] },
      { title: "Where you were born and grew up", lines: ["I was born in Canada but my family is originally from Holland.", "I grew up out in the country.", "I grew up in the city."] },
      { title: "Something you love", lines: ["I love technology.", "It is one of my favorite things in the whole world."] },
      { title: "Things you used to do", lines: ["I used to be a construction worker.", "I used to go skiing."] },
      { title: "Your hobbies", lines: ["I love reading.", "My favorite thing to do is to read a good science fiction novel."] },
      { title: "A country you want to visit", lines: ["I really want to go to France.", "I would love to visit the country of France."] },
    ],
    model: {
      title: "Introduce yourself",
      text: "Hi, I'm [name]. I was born in [Vietnam] and I grew up [in the city]. I'm [the middle child]: I have [an older brother and a younger sister]. When I was younger, I used to [be a student in Hanoi]. I love [technology]. It is one of my favorite things in the whole world. My favorite thing to do is to [read a good novel]. I don't really like [horror films], I prefer [comedies]. I'm a little bit afraid of [snakes]. One day, I would love to visit [France].",
    },
    questions: [
      { question: "What is Bob afraid of?", options: ["Heights", "Spiders", "The dark", "Dogs"] },
      { question: "Where is Bob's family originally from?", options: ["Holland", "France", "Italy", "Britain"] },
      { question: "Where did Bob grow up?", options: ["Out in the country", "In Toronto", "In a big city", "In France"] },
      { question: "What job did Bob use to have in the summers?", options: ["Construction worker", "Teacher", "Farmer", "Bus driver"] },
      { question: "Which country does Bob really want to visit?", options: ["France", "Italy", "Japan", "Holland"] },
    ],
  },
  ecF1y2bI2T4: {
    overview:
      "Bob takes you through his morning and his work day, in order, from the moment he wakes up until he says goodbye to his colleagues. For many steps he gives two ways to say the same thing, like 'eat breakfast' and 'have breakfast'.",
    sections: [
      { title: "Waking up", lines: ["I usually press the snooze button on my alarm clock", "the second thing I do in the morning is I get up", "I like to make the bed"] },
      { title: "Breakfast", lines: ["I usually fry two eggs in a frying pan", "You can say, \"I eat breakfast,\" but you can also say, \"I have breakfast.\"", "I like to check my email every morning and I like to read the news every morning."] },
      { title: "Getting ready", lines: ["You can say, \"Every day I take a shower.\"", "I get dressed", "I will brush my teeth"] },
      { title: "Lunch and leaving the house", lines: ["So in English, we would say, \"Every day I make a lunch.\"", "I grab my keys, I grab my phone, I grab my wallet", "I go to work"] },
      { title: "At work", lines: ["I teach my first class of the day", "I eat my lunch and I talk to the other teachers", "I say bye, bye everybody"] },
    ],
    model: {
      title: "Describe your morning",
      text: "The very first thing I do every day is I wake up. Then I get up and I make the bed. After that, I [take a shower] and I get dressed. Then I make breakfast: I usually [fry two eggs] and I make myself [a mug of coffee]. I eat breakfast and I [check my email]. After that, I brush my teeth, I grab my things and I go to [work] at about [7:30].",
    },
    questions: [
      { question: "What does Bob usually do when his alarm goes off?", options: ["Press the snooze button", "Get up right away", "Check his phone", "Make coffee"] },
      { question: "What does Bob usually eat for breakfast?", options: ["Two eggs and two pieces of toast", "A banana and cereal", "Pancakes", "A sandwich"] },
      { question: "Why does Bob make a lunch every day?", options: ["He doesn't like to spend money", "He doesn't like the school food", "His wife asks him to", "He works far away"] },
      { question: "How long does Bob's drive to work take?", options: ["About 10 minutes", "About 30 minutes", "About an hour", "He walks to work"] },
      { question: "What does Bob teach in computer class?", options: ["How to make video games", "How to type", "How to send email", "French"] },
    ],
  },
  uUMPULuwdLI: {
    overview:
      "Bob goes to four places, a pizza shop, a burger place, a sub shop and a coffee shop, and orders with a different phrase each time: 'I would like to order', 'I'll have', 'Could I have' and 'Could I get'. You also hear the questions staff ask you.",
    sections: [
      { title: "I would like to order", lines: ["I would like to order a small pepperoni pizza.", "Is it for pickup?", "That's everything for today"] },
      { title: "I'll have", lines: ["I'll have the Teen Burger.", "for here or to go", "To go, please."] },
      { title: "Could I have", lines: ["Could I have a cold cut combo?", "What would you like on that?", "Some tomatoes, some spinach, and some cucumbers, please."] },
      { title: "Could I get", lines: ["could I get six donuts?", "Could I get a large peppermint tea?", "Do you have a rewards card today?"] },
    ],
    model: {
      title: "Order food",
      text: "— Hi, how can I help you?\n— Hi, I would like to order [a small pepperoni pizza].\n— For here or to go?\n— To go, please. Could I have [a root beer] too?\n— Is that everything?\n— That's everything for today.\n— Is that cash or debit?\n— [Debit], please.",
    },
    questions: [
      { question: "Which phrase does Bob use to order the pizza?", options: ["I would like to order", "Could I get", "I'll have", "Can you give me"] },
      { question: "Is the burger for here or to go?", options: ["To go", "For here", "Bob doesn't say", "It's delivered"] },
      { question: "What does Bob put on his sub?", options: ["Tomatoes, spinach and cucumbers", "Onions and peppers", "Only cheese", "Lettuce and olives"] },
      { question: "What does Jen ask Bob to get her?", options: ["A peppermint tea", "A coffee", "Six donuts", "A root beer"] },
      { question: "Who are the donuts for?", options: ["Bob's kids", "Jen", "The teachers at school", "Bob himself"] },
    ],
  },
  HQUW4T0w2zY: {
    overview:
      "Bob walks through a shopping mall in Canada. He starts with ways to say you are shopping, then names the kinds of stores you find there, the useful places like the drugstore and the food court, and ends by ordering a burger.",
    sections: [
      { title: "Saying you are shopping", lines: ["I'm here today to go shopping.", "I'm here today to do some shopping.", "I'm here to grab some things."] },
      { title: "Finding your way", lines: ["You'll usually find a map like this close to the entrance of the mall.", "right now I'm going down the escalator"] },
      { title: "Kinds of stores", lines: ["This store behind me is a computer store.", "This is where you would come if you wanted to buy a new pair of shoes.", "A department store is a large store that sells pretty much everything.", "This is a toy store."] },
      { title: "Useful places", lines: ["we would call this either a drugstore or a pharmacy", "The food court is the place in the mall where you can find all different types of restaurants."] },
      { title: "Ordering at the food court", lines: ["could I get a double buddy burger with no onions", "For here, please.", "And how would you like to pay?"] },
    ],
    model: {
      title: "Talk about a trip to the mall",
      text: "I'm here today to do some shopping. First, I want to grab [a new pair of shoes], so I'm going to [the shoe store]. Then I need [some bandages], so I'll go to the drugstore. After that, I'll go to the food court.\n— Could I get [a burger with no onions]?\n— For here or to go?\n— For here, please.",
    },
    questions: [
      { question: "Why is the mall a little bit empty?", options: ["It's a Monday afternoon", "It's a holiday", "The mall is closing", "It's raining"] },
      { question: "What is a kiosk?", options: ["A small shop in the middle part of the mall", "A big store with many floors", "The place with restaurants", "The map of the mall"] },
      { question: "Why is the music store closed?", options: ["People usually get their music online now", "It's lunch time", "It moved to another mall", "It only opens at night"] },
      { question: "Where is the washroom usually?", options: ["At the back of the food court", "Next to the entrance", "On the top floor", "Inside the department store"] },
      { question: "What does Bob order at the food court?", options: ["A burger with no onions", "Chicken and fries", "A sub", "Coffee and a bagel"] },
    ],
  },
  _UwT0tC5JTk: {
    overview:
      "On his farm, Bob acts out prepositions of place so they are easy to remember: in and inside, above and below, between and among, left and right, next to and near, around and past, on and under, and away from, toward and behind.",
    sections: [
      { title: "In and inside", lines: ["As you can see, I am in this barrel.", "I could also say that I'm inside this barrel."] },
      { title: "Above and below", lines: ["Right now, I am above you.", "I am higher than you.", "You are lower than me."] },
      { title: "Between and among", lines: ["Right now, I am standing between these two flower rows.", "I am standing among the flowers."] },
      { title: "Left and right", lines: ["I will put the dolly to the right of the wagon.", "The dolly is on the left."] },
      { title: "Next to, beside, near", lines: ["I am next to my tractor.", "I am beside my tractor.", "I'm standing close to the tractor."] },
      { title: "Around and past", lines: ["So when you go around something, you need to change direction in order to get by.", "I don't need to change direction to go past something."] },
      { title: "On and under", lines: ["Right now, I am on the hay elevator.", "I am underneath the hay elevator."] },
      { title: "Away from, toward, behind", lines: ["Right now, I am walking away from the camera.", "I can also say I'm walking towards the camera.", "Right now, I am behind the tree."] },
    ],
    model: {
      title: "Describe where you are",
      text: "Right now, I am [in my bedroom]. I'm standing next to [the window], and [the desk] is on the left. My phone is on top of [the desk] and my bag is under [the chair]. [The door] is behind me. When I go out, I walk past [the park] and toward [the bus stop].",
    },
    questions: [
      { question: "Where is Bob at the start of the video?", options: ["Inside a barrel", "On a tractor", "Behind a tree", "On a balcony"] },
      { question: "What does 'upside down' mean?", options: ["The top part is at the bottom", "Something is very old", "Something is inside out", "Something is far away"] },
      { question: "Bob has flowers all around him. Where is he standing?", options: ["Among the flowers", "Between the flower rows", "Above the flowers", "Past the flowers"] },
      { question: "When do you go around something?", options: ["When it is in your way", "When you only see it on the way", "When it is behind you", "When it is far from you"] },
      { question: "What is true about 'toward' and 'towards'?", options: ["They mean the same thing", "They are opposites", "Only one is correct", "'Towards' means far from"] },
    ],
  },
};
