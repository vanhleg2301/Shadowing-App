// Role-play scripts for "Speak A2 in 7 days". The app reads the partner's lines aloud;
// the learner reads and records their own lines ("you"), using that day's phrases.

export interface DialogueLine {
  speaker: "partner" | "you";
  text: string;
}

export interface CourseDialogue {
  setting: string;
  partnerRole: string;
  lines: DialogueLine[];
}

export const COURSE_DIALOGUES: Record<number, CourseDialogue> = {
  1: {
    setting: "You meet a new classmate before an English class.",
    partnerRole: "Classmate",
    lines: [
      { speaker: "partner", text: "Hi! I don't think we've met. I'm Sam." },
      { speaker: "you", text: "Hi Sam, nice to meet you. I'm Linh." },
      { speaker: "partner", text: "Nice to meet you too. Where are you from?" },
      { speaker: "you", text: "I'm from Hanoi, in the north of Vietnam. How about you?" },
      { speaker: "partner", text: "I'm from Manchester. So, what do you do?" },
      { speaker: "you", text: "I work as a designer. In my free time, I play badminton." },
      { speaker: "partner", text: "Cool! How long have you been learning English?" },
      { speaker: "you", text: "I've been learning English for two years. Sorry, could you say your name again?" },
      { speaker: "partner", text: "Sure, it's Sam. The class is starting now." },
      { speaker: "you", text: "OK. It was nice talking to you. See you soon!" },
    ],
  },
  2: {
    setting: "A friend asks about your week over coffee.",
    partnerRole: "Friend",
    lines: [
      { speaker: "partner", text: "You look tired. Busy week?" },
      { speaker: "you", text: "Yes, very busy. I usually get up at six thirty, but this week I got up at six." },
      { speaker: "partner", text: "Wow, early. What do you do after that?" },
      { speaker: "you", text: "First, I have a shower. Then I have breakfast and go to work." },
      { speaker: "partner", text: "What did you do yesterday?" },
      { speaker: "you", text: "Yesterday I worked late, and after that I cooked dinner at home." },
      { speaker: "partner", text: "Any plans for the weekend?" },
      { speaker: "you", text: "I'm going to visit my parents on Saturday. What about you?" },
      { speaker: "partner", text: "Just relaxing, I think. Enjoy your weekend!" },
      { speaker: "you", text: "Thanks, you too!" },
    ],
  },
  3: {
    setting: "You order lunch in a café.",
    partnerRole: "Waiter",
    lines: [
      { speaker: "partner", text: "Hi there, are you ready to order?" },
      { speaker: "you", text: "Yes, please. Could I have the chicken sandwich?" },
      { speaker: "partner", text: "Of course. Anything to drink?" },
      { speaker: "you", text: "I'd like an iced coffee, please. Does the sandwich come with salad?" },
      { speaker: "partner", text: "Yes, it comes with a small salad. Is that for here or to take away?" },
      { speaker: "you", text: "For here, please." },
      { speaker: "partner", text: "Here you are. Is everything OK?" },
      { speaker: "you", text: "It's delicious, thank you. Can I have the bill, please?" },
      { speaker: "partner", text: "That's twelve pounds fifty. Cash or card?" },
      { speaker: "you", text: "Card, please. Thanks a lot." },
    ],
  },
  4: {
    setting: "You are buying a jacket in a clothes shop.",
    partnerRole: "Shop assistant",
    lines: [
      { speaker: "partner", text: "Hello, can I help you?" },
      { speaker: "you", text: "Yes, please. I'm looking for a warm jacket." },
      { speaker: "partner", text: "These ones are new. What size are you?" },
      { speaker: "you", text: "I'm a medium. How much is this one?" },
      { speaker: "partner", text: "It's sixty pounds. Would you like to try it on?" },
      { speaker: "you", text: "Yes, please. Where are the changing rooms?" },
      { speaker: "partner", text: "Just over there. How is it?" },
      { speaker: "you", text: "It's a bit small. Do you have it in a large?" },
      { speaker: "partner", text: "Yes, here you go." },
      { speaker: "you", text: "Perfect, I'll take it. Can I pay by card?" },
    ],
  },
  5: {
    setting: "You are lost and ask someone in the street for help.",
    partnerRole: "Local person",
    lines: [
      { speaker: "you", text: "Excuse me, could you help me? I'm looking for the train station." },
      { speaker: "partner", text: "Sure. Go straight on and turn left at the traffic lights." },
      { speaker: "you", text: "Turn left at the traffic lights. Is it far from here?" },
      { speaker: "partner", text: "It's about ten minutes on foot." },
      { speaker: "you", text: "Is there a bus that goes there?" },
      { speaker: "partner", text: "Yes, the number twelve. The bus stop is just across the road." },
      { speaker: "you", text: "How often does it come?" },
      { speaker: "partner", text: "Every fifteen minutes, I think." },
      { speaker: "you", text: "Great. Thank you so much for your help." },
      { speaker: "partner", text: "No problem. Have a good trip!" },
    ],
  },
  6: {
    setting: "You call a clinic to book an appointment.",
    partnerRole: "Receptionist",
    lines: [
      { speaker: "partner", text: "Good morning, City Clinic. How can I help?" },
      { speaker: "you", text: "Hello, I'd like to make an appointment, please. I don't feel very well." },
      { speaker: "partner", text: "I'm sorry to hear that. What's the problem?" },
      { speaker: "you", text: "I have a headache and a sore throat. It started two days ago." },
      { speaker: "partner", text: "Do you have a temperature?" },
      { speaker: "you", text: "Yes, I think I have a slight fever." },
      { speaker: "partner", text: "The doctor can see you at three this afternoon. Is that OK?" },
      { speaker: "you", text: "Three o'clock is fine. Should I bring anything?" },
      { speaker: "partner", text: "Just your ID card, please. Drink lots of water and rest." },
      { speaker: "you", text: "Thank you. See you at three." },
    ],
  },
  7: {
    setting: "At a hotel, you check in and solve a problem with your room.",
    partnerRole: "Receptionist",
    lines: [
      { speaker: "partner", text: "Good evening, welcome to the hotel. Do you have a booking?" },
      { speaker: "you", text: "Good evening. Yes, I have a booking under the name Tran." },
      { speaker: "partner", text: "Ah yes, two nights. Here's your key. Room 305." },
      { speaker: "you", text: "Thank you. What time is breakfast?" },
      { speaker: "partner", text: "From seven to ten, on the ground floor." },
      { speaker: "you", text: "Sorry, there's a problem. The air conditioning in my room isn't working." },
      { speaker: "partner", text: "I'm so sorry about that. We can move you to another room." },
      { speaker: "you", text: "That would be great. Also, could you recommend a good place to eat nearby?" },
      { speaker: "partner", text: "There's a lovely Italian restaurant just around the corner." },
      { speaker: "you", text: "Perfect. Thanks for your help." },
    ],
  },
};
