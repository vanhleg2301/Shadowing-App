import Image from "next/image";
import Link from "next/link";
import { CHANNEL_NAME, type CuratedVideo, type Level } from "@/data/curated";

export const LEVEL_DOT: Record<Level, string> = {
  A1: "bg-green-400",
  A2: "bg-amber-400",
  B1: "bg-sky-400",
};

interface VideoCardProps {
  video: CuratedVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      href={`/watch/${video.videoId}`}
      className="group block h-full rounded-3xl border border-line bg-white p-3 shadow-[0_4px_0_0_var(--color-line)] transition-transform hover:-translate-y-0.5"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-cream">
        <Image
          src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
          alt={video.title}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 80vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-bold text-white">
          <span className={`size-1.5 rounded-full ${LEVEL_DOT[video.level]}`} />
          {video.level}
        </span>
        <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-ink/85 px-2 py-0.5 text-xs font-semibold text-white">
          {video.duration}
        </span>
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="line-clamp-2 text-[17px] font-semibold leading-snug text-ink">{video.title}</p>
        <p className="mt-1 text-sm text-muted">{CHANNEL_NAME}</p>
      </div>
    </Link>
  );
}
