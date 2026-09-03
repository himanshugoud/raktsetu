import { Resend } from "resend";

let resend = null;

function getClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Sends an urgent alert email to a single donor about a nearby compatible
// blood request. Failures are logged but never thrown, so one bad email
// address never breaks the rest of the notification batch.
export async function sendUrgentAlert({ to, donorName, request, distanceKm }) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const acceptUrl = `${clientUrl}/requests/${request._id}?action=accept`;

  const subject = `Urgent: ${request.bloodType} blood needed near you`;

  const text = `Hi ${donorName},

Someone needs ${request.bloodType} blood urgently at ${request.hospitalName}.
Urgency level: ${request.urgency}
Distance from you: approximately ${distanceKm.toFixed(1)} km

If you're available to help, please open RaktSetu and respond:
${acceptUrl}

Thank you for being a registered donor.
- RaktSetu`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#B3261E;">Urgent: ${request.bloodType} blood needed near you</h2>
      <p>Hi ${donorName},</p>
      <p>Someone needs <strong>${request.bloodType}</strong> blood urgently at
      <strong>${request.hospitalName}</strong>.</p>
      <p>Urgency level: <strong>${request.urgency}</strong><br/>
      Distance from you: approximately <strong>${distanceKm.toFixed(1)} km</strong></p>
      <p><a href="${acceptUrl}" style="background:#B3261E;color:#fff;padding:10px 18px;
      border-radius:6px;text-decoration:none;display:inline-block;">Respond to this request</a></p>
      <p style="color:#666;font-size:13px;">Thank you for being a registered donor on RaktSetu.</p>
    </div>`;

  try {
    const { data, error } = await getClient().emails.send({
      from: process.env.RESEND_FROM || "RaktSetu Alerts <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`Failed to send alert email to ${to}:`, error.message || error);
      return false;
    }

    console.log(`Alert email accepted by Resend for ${to} — id: ${data?.id}`);
    return true;
  } catch (err) {
    console.error(`Failed to send alert email to ${to}:`, err.message);
    return false;
  }
}

export async function sendPasswordResetEmail({ to, donorName, resetUrl }) {
  const subject = "Reset your RaktSetu password";

  const text = `Hi ${donorName},\n\nWe received a request to reset your RaktSetu password.\nThis link is valid for 1 hour:\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email — your password won't be changed.\n\n- RaktSetu`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#B3261E;">Reset your RaktSetu password</h2>
      <p>Hi ${donorName},</p>
      <p>We received a request to reset your password. This link is valid for <strong>1 hour</strong>.</p>
      <p><a href="${resetUrl}" style="background:#B3261E;color:#fff;padding:10px 18px;
      border-radius:6px;text-decoration:none;display:inline-block;">Reset password</a></p>
      <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
    </div>`;

  try {
    const { data, error } = await getClient().emails.send({
      from: process.env.RESEND_FROM || "RaktSetu Alerts <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`Failed to send password reset email to ${to}:`, error.message || error);
      return false;
    }

    console.log(`Password reset email accepted by Resend for ${to} — id: ${data?.id}`);
    return true;
  } catch (err) {
    console.error(`Failed to send password reset email to ${to}:`, err.message);
    return false;
  }
}

export default { sendUrgentAlert, sendPasswordResetEmail };