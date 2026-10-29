import Image from "next/image";
import { Icon } from "@/components/Icon";

interface VideoFacadeProps {
  videoId: string;
  onPlay: () => void;
}

// Stands in for the YouTube player until the first tap, so the lesson page doesn't load YouTube's
// scripts up front.
export function VideoFacade({ videoId, onPlay }: VideoFacadeProps) {
  return (
    <button type="button" onClick={onPlay} aria-label="Play video" className="group absolute inset-0">
      <Image src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
      <span className="absolute inset-0 grid place-items-center bg-black/20">
        <span className="grid size-16 place-items-center rounded-full bg-brand text-on-brand shadow-lg transition-transform group-active:scale-95">
          <Icon name="play" className="size-7" />
        </span>
      </span>
    </button>
  );
}
