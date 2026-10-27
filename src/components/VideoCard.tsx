import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CHANNEL_NAME, type CuratedVideo, type Level } from "@/data/curated";
import { getThumbnailUrl } from "@/lib/media";

export const LEVEL_DOT: Record<Level, string> = {
  A1: "bg-green-400",
  A2: "bg-amber-400",
  B1: "bg-sky-400",
};

interface VideoCardProps {
  // Favorites can include pasted-link videos, which have no level or duration.
  video: Pick<CuratedVideo, "videoId" | "title"> & Partial<Pick<CuratedVideo, "level" | "duration" | "channel">>;
  subtitle?: string;
  isFavorite: boolean;
  progress?: number;
}

export function VideoCard({ video, subtitle, isFavorite, progress }: VideoCardProps) {
  return (
    <div className="relative h-full">
      <Link
        href={`/watch/${video.videoId}`}
        className="group block h-full animate-fade-up rounded-3xl border border-line bg-surface p-3 shadow-[0_4px_0_0_var(--color-line)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_0_var(--color-line)] active:translate-y-0 active:shadow-[0_2px_0_0_var(--color-line)]"
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-cream">
          <Image
            src={getThumbnailUrl(video.videoId)}
            alt={video.title}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 80vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {video.level && (
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
              <span className={`size-1.5 rounded-full ${LEVEL_DOT[video.level]}`} />
              {video.level}
            </span>
          )}
          {video.duration && (
            <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
              {video.duration}
            </span>
          )}
          {progress !== undefined && progress > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30" aria-label={`${progress}% watched`}>
              <div className={`h-full ${progress >= 100 ? "bg-green-400" : "bg-accent"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          )}
        </div>
        <div className="px-1 pb-1 pt-3">
          <p className="line-clamp-2 text-[17px] font-semibold leading-snug text-ink">{video.title}</p>
          <p className="mt-1 text-sm text-muted">{subtitle ?? video.channel ?? CHANNEL_NAME}</p>
        </div>
      </Link>
      <div className="absolute right-5 top-5">
        <FavoriteButton videoId={video.videoId} title={video.title} initialIsFavorite={isFavorite} size="sm" />
      </div>
    </div>
  );
}
