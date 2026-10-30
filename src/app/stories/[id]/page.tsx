import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { LessonSkeleton } from "@/components/Skeleton";
import { StoryReader } from "@/components/StoryReader";
import { STORIES, getStory, toStoryListItem } from "@/data/stories";
import { getLessonUserState } from "@/lib/user-data";

export function generateStaticParams() {
  return STORIES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/stories/[id]">): Promise<Metadata> {
  const story = getStory((await params).id);
  return { title: story ? `${story.title} · Shadowing English` : "Story" };
}

export default function StoryPage({ params }: PageProps<"/stories/[id]">) {
  return (
    <AppShell active="/stories">
      <Suspense fallback={<LessonSkeleton />}>
        {params.then(({ id }) => (
          <StoryContent id={id} />
        ))}
      </Suspense>
    </AppShell>
  );
}

async function StoryContent({ id }: { id: string }) {
  const story = getStory(id);
  if (!story) notFound();
  const userState = await getLessonUserState(id).catch(() => ({ savedWords: [] as string[] }));
  return <StoryReader story={story} initialSavedWords={userState.savedWords} allStories={STORIES.map(toStoryListItem)} />;
}
