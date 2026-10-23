"use client";

import { deletePushSubscription, savePushSubscription, type ActionResult } from "@/app/actions";

export type PushSupport = "supported" | "needs-install" | "unsupported";

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  const hasApi = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (hasApi) return "supported";
  // iOS only offers web push to apps added to the Home Screen.
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return isIos ? "needs-install" : "unsupported";
}

function toUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export async function enableReminders(): Promise<ActionResult | { ok: false; error: "denied" | "not-configured" }> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, error: "not-configured" };
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, error: "denied" };

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toUint8Array(publicKey) }));
  const json = subscription.toJSON();
  return savePushSubscription({ endpoint: subscription.endpoint, keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" } });
}

export async function disableReminders(): Promise<ActionResult> {
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return deletePushSubscription({ endpoint: "" });
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return deletePushSubscription({ endpoint });
}
