import type { Crumb } from "@/components/Breadcrumbs";
import { dayInWeek, weekOf } from "@/data/course-weeks";

// Breadcrumb trail for a lesson page, from where it was opened (?from=course-3 gives /course/3).
export function getLessonTrail(backHref: string): Crumb[] {
  const day = Number(backHref.match(/^\/course\/(\d+)$/)?.[1]);
  return day
    ? [{ label: "Course", href: "/course" }, { label: `Week ${weekOf(day)} · Day ${dayInWeek(day)}`, href: backHref }, { label: "Lesson" }]
    : [{ label: "Lesson" }];
}
