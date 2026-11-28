// The course's 2-minute level check: five sentences to hear, from A1 to B1.
export interface LevelCheckQuestion {
  sentence: string;
  rate: number;
  question: string;
  options: string[];
  answer: number;
}

// From A1 to B1, a little faster each time. The learner only hears the sentence.
export const LEVEL_CHECK_QUESTIONS: LevelCheckQuestion[] = [
  { sentence: "My name is Tom and I'm twenty years old.", rate: 0.8, question: "How old is Tom?", options: ["12", "20", "22"], answer: 1 },
  {
    sentence: "I usually get up at seven and have breakfast at home.",
    rate: 0.85,
    question: "What time does the speaker get up?",
    options: ["At seven", "At eleven", "At eight"],
    answer: 0,
  },
  {
    sentence: "Excuse me, could you tell me where the nearest train station is?",
    rate: 0.9,
    question: "What does the speaker want?",
    options: ["A train ticket", "Directions", "A taxi"],
    answer: 1,
  },
  {
    sentence: "I've been feeling really tired lately, so I'm going to see the doctor tomorrow.",
    rate: 1,
    question: "Why is the speaker going to the doctor?",
    options: ["They broke their leg", "They start a new job", "They feel tired"],
    answer: 2,
  },
  {
    sentence: "If it hadn't rained, we would have gone to the beach instead of staying in all day.",
    rate: 1.05,
    question: "What did they do?",
    options: ["Stayed at home", "Went to the beach", "Swam in the rain"],
    answer: 0,
  },
];
