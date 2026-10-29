import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import type { CollectionId } from "@/data/collections";
import { getCourse } from "@/data/courses";
import { getStoryOfTheDay } from "@/data/stories";
import type { CourseMode } from "@/lib/course-mode";
import { getCourseProgress, getDueWords } from "@/lib/user-data";

interface Task {
  href: string;
  icon: IconName;
  label: string;
  title: string;
  detail: string;
}

// "Today": the next step of the 7-day course, the words due for review and a fresh news story,
// so a signed-in learner can start without browsing. Renders nothing when signed out.
export async function TodayPlan({ collection, mode }: { collection: CollectionId; mode: CourseMode }) {
  const course = getCourse(collection, mode);
  const [progress, due] = await Promise.all([
    getCourseProgress(course.getId(collection)).catch(() => null),
    getDueWords(1).catch(() => null),
  ]);
  if (!progress) return null;

  const tasks: Task[] = [];
  const nextDay = course.days.find((day) => {
    const finished = new Set(progress[day.day] ?? []);
    return course.getBlocks(day, collection).some((b) => !b.isOptional && !finished.has(b.id));
  });
  if (nextDay) {
    const finished = new Set(progress[nextDay.day] ?? []);
    const nextBlock = course.getBlocks(nextDay, collection).find((b) => !b.isOptional && !finished.has(b.id));
    tasks.push({
      href: `/course/${nextDay.day}`,
      icon: "course",
      label: `Course · day ${nextDay.day} of ${course.days.length}`,
      title: nextDay.title,
      detail: nextBlock ? `Next: ${nextBlock.title}` : "Keep going",
    });
  }
  if (due && due.dueCount > 0) {
    tasks.push({
      href: "/review",
      icon: "repeat",
      label: "Review",
      title: `${due.dueCount} ${due.dueCount === 1 ? "word" : "words"} to review`,
      detail: "A few minutes of flashcards keeps them in your head",
    });
  }
  const story = getStoryOfTheDay();
  tasks.push({
    href: `/stories/${story.id}`,
    icon: "chat",
    label: `Today's story · ${story.level}`,
    title: story.title,
    detail: story.kind === "small-talk" ? "Small talk · read or listen" : "Read or listen like a podcast",
  });
  if (tasks.length === 0) return null;

  return (
    <section className="mt-4 animate-fade-up rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-lg font-extrabold text-ink">Today</h2>
      <ul className="mt-3 grid gap-2 md:grid-cols-3">
        {tasks.map((task) => (
          <li key={task.href}>
            <Link href={task.href} className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-cream p-3 transition-colors hover:border-brand">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon name={task.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-accent">{task.label}</span>
                <span className="block truncate font-bold text-ink group-hover:text-brand">{task.title}</span>
                <span className="block truncate text-xs text-muted">{task.detail}</span>
              </span>
              <Icon name="chevronRight" className="size-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
