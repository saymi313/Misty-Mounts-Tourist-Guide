import api from "../data/api";

/** Browser Web-Push helpers. Requires the service worker (production build). */

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Current state: { supported, subscribed, permission }. */
export async function getPushState() {
  if (!pushSupported()) return { supported: false, subscribed: false, permission: "default" };
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return { supported: true, subscribed: !!sub, permission: Notification.permission };
}

/** Ask permission, subscribe, and register the subscription with the backend. */
export async function enablePush() {
  if (!pushSupported()) throw new Error("unsupported");
  const { data } = await api.get("/push/public-key");
  if (!data || !data.enabled || !data.key) throw new Error("not-configured");

  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("denied");

  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.key),
    });
  }
  await api.post("/push/subscribe", { subscription: sub });
  return true;
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    await api.post("/push/unsubscribe", { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  return true;
}
