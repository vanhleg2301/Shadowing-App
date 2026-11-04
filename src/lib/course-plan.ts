// The whole course for a collection: week 1 as hand-picked, then the weeks built from the collection. Progress is
// stored per week (week 1 under the course's own id, so earlier progress still counts) with the day of that week.
import type { CollectionId } from "@/data/collections";
import type { CourseBlock, CourseDay } from "@/data/course-a2";
import { buildLaterWeeks, completeWeekOne, dayInWeek, MIN_LATER_WEEK_VIDEOS, weekOf } from "@/data/course-weeks";
import { getCourse, isCourseDayComplete, type Course } from "@/data/courses";
import { getCatalog, getVideoCollection } from "./catalog";
import type { CourseMode } from "./course-mode";
import { getCoursesProgress } from "./user-data";

export interface CoursePlan {
  course: Course;
  collection: CollectionId;
  days: CourseDay[];
  weekCount: number;
}

export function getProgressId(plan: Pick<CoursePlan, "course" | "collection">, day: number): string {
  const week = weekOf(day);
  const base = plan.course.getId(plan.collection);
  return week === 1 ? base : `${base}:w${week}`;
}

export const getProgressDay = dayInWeek;

export async function getCoursePlan(collection: CollectionId, mode: CourseMode): Promise<CoursePlan> {
  const course = getCourse(collection, mode);
  const weekOneVideos = course.days.map((day) => course.getVideos(day, collection));
  const usedIds = new Set(weekOneVideos.flat().map((v) => v.id));
  const weekOne = completeWeekOne(course.days, weekOneVideos.map(([main]) => main));

  const catalog = await getCatalog().catch(() => []);
  const isUsable = (id: CollectionId) => catalog.filter((v) => getVideoCollection(v) === id && v.hasTranscript !== false && !v.category);
  const own = isUsable(collection).filter((v) => !usedIds.has(v.videoId));
  const source = own.length >= MIN_LATER_WEEK_VIDEOS ? own : isUsable(course.fallbackCollection);
  const days = [...weekOne, ...buildLaterWeeks(source, usedIds, course.startLevel)];
  return { course, collection, days, weekCount: weekOf(days[days.length - 1].day) };
}

export function getDay(plan: CoursePlan, day: number): CourseDay | undefined {
  return plan.days.find((d) => d.day === day);
}

export function getDayBlocks(plan: CoursePlan, day: CourseDay): CourseBlock[] {
  return plan.course.getBlocks(day, plan.collection);
}

// Finished blocks per course day, counted across weeks. null when signed out.
export async function getPlanProgress(plan: CoursePlan): Promise<Record<number, string[]> | null> {
  const ids = Array.from({ length: plan.weekCount }, (_, i) => getProgressId(plan, i * 7 + 1));
  const byCourse = await getCoursesProgress(ids).catch(() => null);
  if (!byCourse) return null;
  const progress: Record<number, string[]> = {};
  for (const day of plan.days) {
    const finished = byCourse[getProgressId(plan, day.day)]?.[getProgressDay(day.day)];
    if (finished) progress[day.day] = finished;
  }
  return progress;
}

export function isPlanDayComplete(plan: CoursePlan, day: CourseDay, progress: Record<number, string[]> | null): boolean {
  if (!progress) return false;
  return isCourseDayComplete(getDayBlocks(plan, day), new Set(progress[day.day] ?? []));
}

// The first day not finished yet: where a signed-in learner carries on.
export function getCurrentDay(plan: CoursePlan, progress: Record<number, string[]> | null): CourseDay {
  return plan.days.find((day) => !isPlanDayComplete(plan, day, progress)) ?? plan.days[plan.days.length - 1];
}
