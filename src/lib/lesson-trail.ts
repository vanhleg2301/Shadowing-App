import type { Crumb } from "@/components/Breadcrumbs";

// Breadcrumb trail for a lesson page, from where it was opened (?from=course-3 gives /course/3).
export function getLessonTrail(backHref: string): Crumb[] {
  const day = backHref.match(/^\/course\/(\d+)$/)?.[1];
  return day ? [{ label: "7-day course", href: "/course" }, { label: `Day ${day}`, href: backHref }, { label: "Lesson" }] : [{ label: "Lesson" }];
}
