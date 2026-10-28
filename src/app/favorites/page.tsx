import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { VideoCard } from "@/components/VideoCard";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { getCatalog, getCollectionCounts, getVideoCollection } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getFavorites, type FavoriteVideo } from "@/lib/user-data";

export default function FavoritesPage() {
  return (
    <AppShell active="/favorites">
      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Favorites</h1>
        <p className="mt-2 text-muted">Videos you saved with the heart button.</p>
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
  if (!favorites) return <SignInPrompt message="Sign in to keep your favorite videos in one place." />;
  // Favorites from other collections are kept but hidden; pasted videos (not in any collection) always show.
  const visible = favorites.filter((f) => {
    const curated = catalog.find((v) => v.videoId === f.videoId);
    return !curated || !collection || getVideoCollection(curated) === collection;
  });
  if (favorites.length === 0) {
    return (
      <p className="mt-8 text-muted">
        No favorites yet. Open a video and tap the heart.{" "}
        <Link href="/" className="font-semibold text-brand">
          Browse videos
        </Link>
      </p>
    );
  }

  return (
    <>
      {collection && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CollectionSwitcher current={collection} counts={counts} />
          <span className="text-sm text-muted">
            {visible.length} of {favorites.length} favorites
          </span>
        </div>
      )}
      {visible.length === 0 && <p className="mt-6 text-muted">No favorites in this collection yet.</p>}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((f) => {
          const curated = catalog.find((v) => v.videoId === f.videoId);
          return <VideoCard key={f.videoId} video={curated ?? f} subtitle={curated ? undefined : "YouTube"} isFavorite />;
        })}
      </div>
    </>
  );
}
