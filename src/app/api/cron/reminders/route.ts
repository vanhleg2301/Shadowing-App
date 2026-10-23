import webpush, { WebPushError } from "web-push";
import { getDayIn } from "@/lib/study-day";
import { createAdminClient } from "@/lib/supabase/admin";

interface SettingsRow {
  user_id: string;
  daily_goal_minutes: number;
  time_zone: string;
}

interface SubscriptionRow {
  endpoint: string;
  user_id: string;
  p256dh: string;
  auth: string;
}

// Runs once a day (vercel.json). Reminds learners who turned reminders on and haven't reached today's goal.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  const admin = createAdminClient();
  if (!publicKey || !privateKey || !subject || !admin) {
    return Response.json({ error: "not-configured" }, { status: 500 });
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data: settingsData, error } = await admin
    .from("user_settings")
    .select("user_id, daily_goal_minutes, time_zone")
    .eq("reminders_enabled", true)
    .limit(5000);
  if (error) return Response.json({ error: "failed" }, { status: 500 });
  const settings = (settingsData ?? []) as SettingsRow[];
  if (settings.length === 0) return Response.json({ sent: 0 });

  const userIds = settings.map((s) => s.user_id);
  const todayByUser = new Map(settings.map((s) => [s.user_id, getDayIn(s.time_zone)]));
  const [{ data: dayData }, { data: subData }] = await Promise.all([
    admin.from("study_days").select("user_id, day, seconds").in("user_id", userIds).in("day", [...new Set(todayByUser.values())]),
    admin.from("push_subscriptions").select("endpoint, user_id, p256dh, auth").in("user_id", userIds),
  ]);
  const secondsByUser = new Map<string, number>();
  for (const row of (dayData ?? []) as { user_id: string; day: string; seconds: number }[]) {
    if (todayByUser.get(row.user_id) === row.day) secondsByUser.set(row.user_id, row.seconds);
  }
  const goalByUser = new Map(settings.map((s) => [s.user_id, s.daily_goal_minutes]));

  let sent = 0;
  const expired: string[] = [];
  await Promise.all(
    ((subData ?? []) as SubscriptionRow[]).map(async (sub) => {
      const goal = goalByUser.get(sub.user_id) ?? 15;
      const seconds = secondsByUser.get(sub.user_id) ?? 0;
      const minutesLeft = Math.ceil((goal * 60 - seconds) / 60);
      if (minutesLeft <= 0) return;
      const payload = JSON.stringify({
        title: seconds === 0 ? "Keep your streak alive" : "Almost there",
        body: seconds === 0 ? `${goal} minutes of English today? One short video is enough to start.` : `${minutesLeft} more minutes to reach today's goal.`,
        url: "/",
      });
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 4 * 3600 });
        sent++;
      } catch (err) {
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) expired.push(sub.endpoint);
        else console.error("Reminder push failed", err);
      }
    }),
  );
  if (expired.length > 0) await admin.from("push_subscriptions").delete().in("endpoint", expired);
  return Response.json({ sent, expired: expired.length });
}
