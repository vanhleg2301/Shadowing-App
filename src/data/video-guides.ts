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
  // English Sponge, week 1
  "4SLlF4clbYI": {
    overview:
      "A slow, clear talk about family: brothers and sisters older or younger than you, parents and children, growing up from child to teenager to adult, living close to or far from your family, and questions you can ask about someone's family.",
    sections: [
      { title: "Brothers and sisters", lines: ["Lots of people have brothers and sisters.", "Some people have a sister who is older than them.", "We call this an older sister.", "And we call this a younger sister."] },
      { title: "Parents and children", lines: ["Everybody has a mother and a father.", "And if somebody is a parent, they might have a son or a daughter.", "But when children grow up, they can take care of themselves."] },
      { title: "Growing up", lines: ["When a child becomes 13 years old, they now become a teenager.", "In some countries, a teenager becomes an adult when they are 18 years old."] },
      { title: "Close to or far from your family", lines: ["Some people live close to their family, but some people live far away from their family.", "Christmas is a good chance for grandparents to see their grandchildren."] },
      { title: "Questions about family", lines: ["How many people are in your family?", "Do you have a son or a daughter?", "When do you spend time with your family?"] },
    ],
    model: {
      title: "Talk about your family",
      text: "There are [four] people in my family: my mother, my father, my [older brother] and me. My brother is [two years] older than me. My parents live [close to me]. Lots of people have busy lives, but I spend time with my family at [the weekend].",
    },
    questions: [
      { question: "What do we call a sister who is older than you?", options: ["An older sister", "A younger sister", "A grandmother", "A daughter"] },
      { question: "At what age does a child become a teenager?", options: ["13", "10", "18", "21"] },
      { question: "Why is Christmas good for many families?", options: ["They can stop, relax and spend time together", "They start new jobs", "They move to another country", "Children go back to school"] },
      { question: "Where does the family of many people live?", options: ["In another country", "In the same house", "Next door", "At school"] },
    ],
  },
  BTo8wSy_QCI: {
    overview:
      "He tells you everything he did yesterday, from morning to night, in the past simple: waking up, breakfast, driving to work, cooking dinner, making a video, a shower, the gym and going to bed.",
    sections: [
      { title: "The morning", lines: ["Yesterday, I woke up at around 8:00 a.m.", "After I woke up, I went to the bathroom.", "For breakfast, I ate some cereal and some toast."] },
      { title: "Going to work", lines: ["I drove to work.", "It took me around 25 minutes to drive to work.", "At 5:00 p.m., I left work."] },
      { title: "The evening", lines: ["after I got home, I cooked dinner.", "I cooked a steak pie.", "It was delicious."] },
      { title: "The night", lines: ["I was in the shower for around 10 minutes.", "I went to the gym to exercise", "I went to bed at around 11:00 p.m."] },
    ],
    model: {
      title: "Talk about yesterday",
      text: "Yesterday, I woke up at around [7:00 a.m.]. After I woke up, I [had a shower]. For breakfast, I ate [some bread]. Then, I [took the bus] to [work]. It took me around [30 minutes]. At [5:00 p.m.], I left work. After I got home, I cooked [dinner]. It was delicious. I went to bed at around [11:00 p.m.].",
    },
    questions: [
      { question: "What time did he wake up?", options: ["At around 8:00 a.m.", "At around 6:00 a.m.", "At midnight", "At 10:00 a.m."] },
      { question: "How did he get to work?", options: ["He drove his car", "He took the bus", "He walked", "He rode a bike"] },
      { question: "What did he cook for dinner?", options: ["A steak pie", "Pasta", "Chicken soup", "Pizza"] },
      { question: "Where did he go after his shower?", options: ["To the gym", "To bed", "To work", "To the shop"] },
    ],
  },
  oiNjevJGadM: {
    overview:
      "A story told with pictures: a man and his daughter go to a coffee shop. They order, the waiter brings the drinks, they drink them, the man pays the bill and they go home.",
    sections: [
      { title: "Going to the coffee shop", lines: ["he is holding her hand", "they're going to the coffee shop to get a drink"] },
      { title: "Ordering", lines: ["the man orders a cup of coffee", "the waiter writes his order down", "She wants a bubble tea"] },
      { title: "The drinks arrive", lines: ["the waiter carries the drinks to the table", "he is carrying the two drinks on the tray", "She is drinking her bubble tea with the straw"] },
      { title: "Coffee and the bill", lines: ["he is putting some sugar into his coffee", "the man uses the spoon to stir the coffee", "he asks the waiter for the bill", "they leave the coffee shop"] },
    ],
    model: {
      title: "Tell the story of a cafe visit",
      text: "[The man] and [his daughter] go to the coffee shop to get a drink. [He] orders a cup of [coffee], and [she] wants a [bubble tea]. The waiter writes the order down and carries the drinks to the table. [He] puts some sugar into [his coffee] and stirs it. Then [he] asks the waiter for the bill, and they leave the coffee shop.",
    },
    questions: [
      { question: "What does the man order?", options: ["A cup of coffee", "A bubble tea", "A glass of water", "Orange juice"] },
      { question: "What does the daughter drink?", options: ["Bubble tea", "Coffee", "Milk", "Hot chocolate"] },
      { question: "How does the waiter carry the drinks?", options: ["On a tray", "In his hands", "In a bag", "On a cart"] },
      { question: "What does the man put into his coffee?", options: ["Sugar", "Milk", "Ice", "Honey"] },
    ],
  },
  yfoMWzJjGGg: {
    overview:
      "Justine goes grocery shopping with a list for tacos. She finds each thing in the produce section and the rest of the store, compares prices, checks her list, pays at the till and reads her receipt.",
    sections: [
      { title: "The shopping list", lines: ["I have a list of the things I need to buy.", "I need to buy limes.", "Can you guess what I'm making?", "I'm making tacos."] },
      { title: "In the produce section", lines: ["The produce section is where all of the fruits and vegetables are.", "So, I'm going to buy a bunch of cilantro.", "I want a small cabbage.", "I want a big red onion."] },
      { title: "Comparing prices", lines: ["But they cost $1.49 each.", "So, this bag is cheaper than buying limes by themselves.", "In Canada, it's really expensive to buy oranges."] },
      { title: "Checking the list and paying", lines: ["Now, I need to check my list.", "Did I get everything?", "Now we're ready to go to the till and we'll buy our groceries.", "So, in total, my groceries to make my tacos cost $36.93."] },
    ],
    model: {
      title: "Talk about your shopping trip",
      text: "Today I'm going grocery shopping. I have a list of the things I need to buy. I need to buy [eggs], [rice] and [some apples]. Can you guess what I'm making? I'm making [fried rice]. In the produce section, I want a [big onion]. The [loose apples] cost [$1] each, so the bag is cheaper. Now, I need to check my list. Did I get everything? Now I'm ready to go to the till.",
    },
    questions: [
      { question: "What is Justine making?", options: ["Tacos", "Pizza", "Soup", "A salad"] },
      { question: "What is the produce section?", options: ["Where the fruits and vegetables are", "Where you pay", "Where the bread is", "Where the drinks are"] },
      { question: "Why does she buy the bag of limes?", options: ["It's cheaper than buying limes one by one", "The loose limes are bad", "She needs twenty limes", "There are no loose limes"] },
      { question: "Why does she buy orange juice instead of oranges?", options: ["Oranges are expensive in Canada", "She drinks it every morning", "Her friend asked for it", "The store has no oranges"] },
      { question: "Which food is hard to find in Canada?", options: ["Jicama", "Cabbage", "Onions", "Cilantro"] },
    ],
  },
  SefOJ2iEcUM: {
    overview:
      "Courtney plays a directions game on a map of a town: from the stadium to the library, the fast food restaurant, the pharmacy, the shop and the police station, going straight, turning left and right at corners and intersections.",
    sections: [
      { title: "Where are we going?", lines: ["We are at the stadium.", "We need to go to the library.", "Where is the library?"] },
      { title: "Going straight", lines: ["We go straight.", "We follow this road."] },
      { title: "Turning at a corner", lines: ["At this corner, we need to turn right.", "Do we need to turn left or do we need to turn right?", "We need to keep going straight to get to the fast food restaurant."] },
      { title: "Next to", lines: ["The pharmacy is next to the fast food restaurant.", "So, we just need to go next door."] },
      { title: "Roads and intersections", lines: ["When there's roads that cross, it's called an intersection.", "We're going to turn right on Park Avenue and we will continue along Park Avenue."] },
    ],
    model: {
      title: "Give directions",
      text: "We are at the [stadium] and we need to go to the [library]. We go straight and follow this road. At this corner, we need to turn [right]. At the next intersection, turn [left] on [Main Street]. Keep going straight. The [library] is next to the [bank].",
    },
    questions: [
      { question: "Where do they start?", options: ["At the stadium", "At the library", "At the zoo", "At the bank"] },
      { question: "How do they get from the stadium to the library?", options: ["They go straight", "They turn left twice", "They take a bus", "They turn right"] },
      { question: "Where is the pharmacy?", options: ["Next to the fast food restaurant", "Next to the library", "Behind the zoo", "On Station Road"] },
      { question: "What is an intersection?", options: ["A place where roads cross", "A big shop", "A bus stop", "The end of a road"] },
      { question: "Which building has an envelope on the front?", options: ["The post office", "The library", "The police station", "The shop"] },
    ],
  },
};
