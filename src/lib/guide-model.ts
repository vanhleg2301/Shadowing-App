// A video guide's model is read aloud without the [brackets] that mark what to change.
export const getGuideModelText = (text: string) => text.replace(/[[\]]/g, "");
