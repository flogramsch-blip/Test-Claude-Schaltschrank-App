import { Capacitor } from "@capacitor/core";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";
import { getMessagingIfSupported, VAPID_KEY } from "./firebase";

async function saveToken(uid: string, token: string) {
  await updateDoc(doc(db, "users", uid), { fcmTokens: arrayUnion(token) });
}

async function registerNativePush(uid: string) {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") return;
  await PushNotifications.register();
  PushNotifications.addListener("registration", (token) => {
    void saveToken(uid, token.value);
  });
}

async function registerWebPush(uid: string) {
  if (!VAPID_KEY) return;
  const messaging = await getMessagingIfSupported();
  if (!messaging) return;
  const { getToken } = await import("firebase/messaging");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (token) await saveToken(uid, token);
}

export async function registerForPushNotifications(uid: string) {
  try {
    if (Capacitor.isNativePlatform()) {
      await registerNativePush(uid);
    } else if ("serviceWorker" in navigator && "Notification" in window) {
      await registerWebPush(uid);
    }
  } catch (err) {
    console.warn("Push-Registrierung fehlgeschlagen:", err);
  }
}

export function showLocalNotification(title: string, body: string) {
  if (Capacitor.isNativePlatform()) {
    void import("@capacitor/local-notifications").then(({ LocalNotifications }) =>
      LocalNotifications.schedule({
        notifications: [
          { id: Date.now() % 100000, title, body, schedule: undefined },
        ],
      }),
    );
    return;
  }
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
