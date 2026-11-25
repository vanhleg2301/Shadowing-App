"use client";

import Image from "next/image";
import { useEffect, useState, type RefObject } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { getHostedMedia } from "@/lib/media";
import type { StudySentence } from "@/lib/video-study";

const SLOW_RATE = 0.75;

// One course video that plays sentence by sentence: YouTube (captions off) or hosted audio, at the plan's speed
// or slower.
export function useCourseVideo(videoId: string, startSeconds: number, playbackRate = 1) {
  const media = getHostedMedia(videoId);
  const youTube = useYouTubePlayer(media ? null : videoId, startSeconds, { hideCaptions: true });
  const audio = useAudioPlayer(media?.audioUrl ?? null, startSeconds);
  const { isPlaying, playSegment, pause, setRate } = media ? audio : youTube;
  const [isSlow, setIsSlow] = useState(playbackRate < 1);

  useEffect(() => {
    setRate(isSlow ? Math.min(playbackRate, SLOW_RATE) : playbackRate);
  }, [isSlow, playbackRate, setRate]);

  return {
    videoId,
    imageUrl: media?.imageUrl ?? null,
    containerRef: youTube.containerRef,
    isPlaying,
    pause,
    isSlow,
    setIsSlow,
    playSentence: (sentence: StudySentence) => playSegment(sentence.start, sentence.end),
  };
}

interface CourseVideoFrameProps {
  video: { videoId: string; imageUrl: string | null; containerRef: RefObject<HTMLDivElement | null> };
  className?: string;
}

export function CourseVideoFrame({ video, className = "" }: CourseVideoFrameProps) {
  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black ${className}`}>
      {/* The YouTube player loads on the first play; the thumbnail shows until then. */}
      <Image src={video.imageUrl ?? `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" fill sizes="42rem" className="object-cover opacity-80" />
      {!video.imageUrl && <div ref={video.containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />}
    </div>
  );
}
