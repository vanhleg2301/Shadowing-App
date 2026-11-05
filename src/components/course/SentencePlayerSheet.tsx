"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { getHostedMedia } from "@/lib/media";
import type { StudySentence } from "@/lib/video-study";

interface SentencePlayerSheetProps {
  videoId: string;
  sentence: StudySentence;
  // The full lesson at this sentence, for more context.
  lessonHref: string;
  playbackRate?: number;
  onClose: () => void;
}

const SLOW_RATE = 0.75;

// Plays one sentence of a course video right on the course page, with the video visible, so the learner can
// hear it, say it and record it without leaving the day.
export function SentencePlayerSheet({ videoId, sentence, lessonHref, playbackRate = 1, onClose }: SentencePlayerSheetProps) {
  const media = getHostedMedia(videoId);
  // Both hooks are always called; only the one matching the video's media mounts a player.
  const youTube = useYouTubePlayer(media ? null : videoId, sentence.start);
  const audio = useAudioPlayer(media?.audioUrl ?? null, sentence.start);
  const { containerRef } = youTube;
  const { isPlaying, playSegment, pause, setRate } = media ? audio : youTube;
  const [isSlow, setIsSlow] = useState(playbackRate < 1);

  const playSentence = () => playSegment(sentence.start, sentence.end);

  useEffect(() => {
    setRate(isSlow ? Math.min(playbackRate, SLOW_RATE) : 1);
  }, [isSlow, playbackRate, setRate]);

  // Opening the sheet is the tap that plays the sentence. Browsers that still block it leave the play button.
  useEffect(() => {
    void playSegment(sentence.start, sentence.end);
    // Only on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BottomSheet title="From the video" onClose={onClose}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {media ? (
          <Image src={media.imageUrl} alt="" fill sizes="32rem" className="object-cover opacity-80" />
        ) : (
          <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
        )}
      </div>
      <p lang="en" className="mt-3 text-lg font-semibold leading-snug text-ink">
        {sentence.text}
      </p>
      {sentence.translation && <p className="mt-1 text-sm text-muted">{sentence.translation}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={isPlaying ? pause : () => void playSentence()} className="btn-3d btn-brand flex-1 px-4 py-2.5 text-sm">
          <Icon name={isPlaying ? "pause" : "play"} className="size-4" />
          {isPlaying ? "Pause" : "Play again"}
        </button>
        <button
          type="button"
          onClick={() => setIsSlow(!isSlow)}
          aria-pressed={isSlow}
          className={`btn-3d px-4 py-2.5 text-sm ${isSlow ? "border-brand text-brand" : ""}`}
        >
          Slower
        </button>
      </div>
      <div className="mt-4">
        <VoiceRecorder
          target={sentence.text}
          onPlayOriginal={playSentence}
          originalDurationSec={sentence.end - sentence.start}
          onBeforeRecord={pause}
          recordLabel="Say it yourself"
        />
      </div>
      <Link href={lessonHref} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
        Open the whole lesson here
        <Icon name="chevronRight" className="size-4" />
      </Link>
    </BottomSheet>
  );
}
