import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ShowMore } from "@/components/ShowMore";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { VideoCard } from "@/components/VideoCard";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getStory, getStoryLabel } from "@/data/stories";
import { getCatalog, getCollectionCounts, getVideoCollection } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getFavoriteHref } from "@/lib/media";
import { getFavorites, type FavoriteVideo } from "@/lib/user-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function FavoritesPage() {
  return (
    <AppShell active="/favorites">
      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <Breadcrumbs items={[{ label: "Favorites" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">Favorites</h1>
        <p className="mt-2 text-muted">Videos, news and stories you saved with the heart button.</p>
        <Suspense fallback={<ListSkeleton />}>
          <FavoritesList />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function FavoritesList() {
  let favorites: FavoriteVideo[] | null;
  try {
    favorites = await getFavorites();
  } catch {
    return <p className="mt-8 text-red-600">Couldn&apos;t load your favorites. Please try again later.</p>;
  }

  const [catalog, collection, counts] = await Promise.all([
    getCatalog(),
    getSelectedCollection().catch(() => null),
    getCollectionCounts(),
  ]);
  if (!favorites) return <SignInPrompt message="Sign in to keep your favorites in one place." />;
  const stories = favorites.filter((f) => getFavoriteHref(f.videoId).startsWith("/stories/"));
  const news = favorites.filter((f) => getFavoriteHref(f.videoId).startsWith("/news/"));
  const videos = favorites.filter((f) => getFavoriteHref(f.videoId).startsWith("/watch/"));
  // Favorites from other collections are kept but hidden; pasted videos (not in any collection) always show.
  const visible = videos.filter((f) => {
    const curated = catalog.find((v) => v.videoId === f.videoId);
    return !curated || !collection || getVideoCollection(curated) === collection;
  });
  if (favorites.length === 0) {
    return (
      <p className="mt-8 text-muted">
        No favorites yet. Open a video, news story or daily story and tap the heart.{" "}
        <Link href="/" className="font-semibold text-brand">
          Browse videos
        </Link>
      </p>
    );
  }

  return (
    <>
      {videos.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-ink">Videos</h2>
          {collection && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CollectionSwitcher current={collection} counts={counts} />
              <span className="text-sm text-muted">
                {visible.length} of {videos.length} videos
              </span>
            </div>
          )}
          {visible.length === 0 && <p className="mt-6 text-muted">No favorites in this collection yet.</p>}
          <ShowMore className="stagger mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((f) => {
              const curated = catalog.find((v) => v.videoId === f.videoId);
              return <VideoCard key={f.videoId} video={curated ?? f} subtitle={curated ? undefined : "YouTube"} isFavorite />;
            })}
          </ShowMore>
        </section>
      )}
      {news.length > 0 && (
        <ReadingSection
          title="News"
          items={news.map((f) => ({
            favorite: f,
            label: f.videoId.startsWith("tc-") ? "AI & Tech" : (catalog.find((v) => v.videoId === f.videoId)?.category ?? "News"),
          }))}
        />
      )}
      {stories.length > 0 && (
        <ReadingSection
          title="Stories"
          items={stories.map((f) => {
            const story = getStory(f.videoId);
            return { favorite: f, label: story ? getStoryLabel(story) : "Story" };
          })}
        />
      )}
    </>
  );
}

interface ReadingSectionProps {
  title: string;
  items: { favorite: FavoriteVideo; label: string }[];
}

function ReadingSection({ title, items }: ReadingSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      <ul className="stagger mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map(({ favorite, label }) => (
          <li key={favorite.videoId} className="relative">
            <Link href={getFavoriteHref(favorite.videoId)} className="pressable block h-full rounded-3xl border border-line bg-surface p-4 pr-16 hover:border-brand">
              <p className="text-xs font-bold uppercase tracking-wide text-accent">{label}</p>
              <p className="mt-1 font-bold text-ink">{favorite.title}</p>
            </Link>
            <div className="absolute right-3 top-3">
              <FavoriteButton videoId={favorite.videoId} title={favorite.title} initialIsFavorite size="sm" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
