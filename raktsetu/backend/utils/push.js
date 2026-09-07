import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:himanshugoud638@gmail.com";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  if (!publicKey || !privateKey) {
    // Missing keys should never crash the app — push is a bonus channel,
    // exactly like email. Requests still succeed without it.
    console.warn("VAPID keys not set — push notifications are disabled.");
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

// Sends a push notification to every subscription a donor has registered
// (they may have enabled it on more than one browser/device). Subscriptions
// the push service reports as expired or revoked (410/404) are pruned from
// the donor's record automatically; other errors are logged but the
// subscription is kept, since it might just be a transient failure.
export async function sendPushToDonor(donor, payload) {
  if (!ensureConfigured()) return;
  if (!donor.pushSubscriptions || donor.pushSubscriptions.length === 0) return;

  const stillValid = [];
  for (const sub of donor.pushSubscriptions) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      stillValid.push(sub);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        continue; // expired/revoked — drop it
      }
      console.warn(`Push notification failed for donor ${donor._id}:`, err.message);
      stillValid.push(sub);
    }
  }

  if (stillValid.length !== donor.pushSubscriptions.length) {
    donor.pushSubscriptions = stillValid;
    await donor.save();
  }
}