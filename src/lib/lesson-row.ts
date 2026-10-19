import type { CaptionSource } from "./captions";
import type { Lesson } from "./lesson";

// Shape of a row in public.lessons (supabase/migrations/002_lessons.sql).
export function toLessonRow(lesson: Lesson, source: CaptionSource) {
  return {
    video_id: lesson.videoId,
    title: lesson.title,
    author: lesson.author,
    duration_sec: lesson.durationSec,
    sentences: lesson.sentences,
    has_translation: lesson.hasTranslation,
    caption_source: source,
  };
}
