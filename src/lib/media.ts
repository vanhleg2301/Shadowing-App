// Lessons imported from VOA Learning English (scripts/voa/import_voa.py) play audio hosted in Supabase
// Storage instead of a YouTube video. Their ids ("voa-" + the 7-digit VOA article id) still fit the
// 11-character video id format, so favorites, progress and saved words work unchanged.
const HOSTED_ID_PATTERN = /^voa-(\d{7})$/;
const MEDIA_BUCKET = "lesson-media";

export interface HostedMedia {
  audioUrl: string;
  imageUrl: string;
}

export function isHostedLesson(videoId: string): boolean {
  return HOSTED_ID_PATTERN.test(videoId);
}

export function getHostedMedia(videoId: string): HostedMedia | null {
  const articleId = videoId.match(HOSTED_ID_PATTERN)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!articleId || !supabaseUrl) return null;
  const base = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/voa/${articleId}`;
  return { audioUrl: `${base}.mp3`, imageUrl: `${base}.jpg` };
}

// Stories and AI & Tech articles have ids of the same length, so they can be favorites too.
export function getFavoriteHref(id: string): string {
  if (isHostedLesson(id)) return `/news/${id}`;
  if (/^tc-\d{8}$/.test(id)) return `/news/ai-tech/${id}`;
  if (/^story-\d{5}$/.test(id)) return `/stories/${id}`;
  return `/watch/${id}`;
}

export function getThumbnailUrl(videoId: string): string {
  return getHostedMedia(videoId)?.imageUrl ?? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}
