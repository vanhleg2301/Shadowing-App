// Sentences the app reads aloud outside lessons, narrated with Kokoro in one recording (scripts/story-audio): the
// level checks' listening and the model texts of the video guides.
import { LEVEL_CHECK_QUESTIONS } from "./level-check";
import { PLACEMENT_QUESTIONS } from "./placement";
import { VIDEO_GUIDES } from "./video-guides";
import { getGuideModelText } from "../lib/guide-model";

export const APP_NARRATION_ID = "app-sentences";


export function getAppNarration(): string[] {
  return [
    ...LEVEL_CHECK_QUESTIONS.map((q) => q.sentence),
    ...PLACEMENT_QUESTIONS.flatMap((q) => (q.listen ? [q.listen] : [])),
    ...Object.values(VIDEO_GUIDES).map((guide) => getGuideModelText(guide.model.text)),
  ];
}
