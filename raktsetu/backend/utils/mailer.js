import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
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
    const info = await getTransporter().sendMail({
      from: `"RaktSetu Alerts" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Alert email accepted by Gmail for ${to} — messageId: ${info.messageId}, response: ${info.response}`);
    return true;
  } catch (err) {
    console.error(`Failed to send alert email to ${to}:`, err.message);
    return false;
  }
}

export default { sendUrgentAlert };