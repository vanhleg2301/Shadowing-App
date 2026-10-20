import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { VideoCard } from "@/components/VideoCard";
import { getCatalog } from "@/lib/catalog";
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

  const catalog = await getCatalog();
  if (!favorites) return <SignInPrompt message="Sign in to keep your favorite videos in one place." />;
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
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {favorites.map((f) => {
        const curated = catalog.find((v) => v.videoId === f.videoId);
        return <VideoCard key={f.videoId} video={curated ?? f} subtitle={curated ? undefined : "YouTube"} isFavorite />;
      })}
    </div>
  );
}
