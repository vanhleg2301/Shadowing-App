export interface WordInfo {
  word: string;
  ipaUk?: string;
  ipaUs?: string;
  contextMeaning?: string;
  meanings: { partOfSpeech: string; definition: string; example?: string }[];
  phrases: { text: string; meaning?: string; example?: string }[];
  source: "ai" | "free";
}

export function normalizeWord(token: string): string {
  return token.replace(/[^A-Za-z'-]/g, "").replace(/^['-]+|['-]+$/g, "").toLowerCase();
}
