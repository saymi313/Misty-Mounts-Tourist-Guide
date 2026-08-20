const webpush = require("web-push");
const PushSubscription = require("../UserBackend/models/pushSubscription");

/**
 * Web-Push helper. Enabled only when VAPID keys are configured in the env
 * (generate with `npx web-push generate-vapid-keys`). When disabled, all sends
 * are no-ops so notifications still work without push.
 */
const PUB = process.env.VAPID_PUBLIC_KEY;
const PRIV = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@mistymounts.pk";
const enabled = Boolean(PUB && PRIV);

if (enabled) {
  try {
    webpush.setVapidDetails(SUBJECT, PUB, PRIV);
  } catch (e) {
    console.error("web-push VAPID config error:", e.message);
  }
}

/** Send a push payload to every subscription a user has; prune dead endpoints. */
async function sendPushToUser(userId, payload) {
  if (!enabled) return;
  try {
    const subs = await PushSubscription.find({ userId }).lean();
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(s.subscription, JSON.stringify(payload));
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await PushSubscription.deleteOne({ _id: s._id }).catch(() => {});
          }
        }
      })
    );
  } catch (err) {
    console.error("sendPushToUser error:", err.message);
  }
}

module.exports = { enabled, publicKey: PUB || null, sendPushToUser };
