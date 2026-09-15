import "dotenv/config";
import * as Sentry from "@sentry/node";

// Fields that can legitimately show up in a request body across this app's
// routes and should never leave the server as-is — donor personal details,
// exact location, and anything credential-shaped. Everything else in the
// body (bloodType, urgency, status, etc.) stays intact, since that's what
// actually helps diagnose a bug.
const SENSITIVE_BODY_FIELDS = [
  "password",
  "email",
  "phone",
  "contactPhone",
  "latitude",
  "longitude",
  "token",
  "resetPasswordTokenHash",
];

// Removes personal data from an error event before it leaves this server.
// Sentry is a third party, and this app handles real names, emails, phone
// numbers, and precise home/hospital locations — none of that belongs in
// a bug report just because a request happened to fail nearby.
function scrubEvent(event) {
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.Authorization;
      delete event.request.headers.cookie;
    }
    if (event.request.data && typeof event.request.data === "object") {
      for (const field of SENSITIVE_BODY_FIELDS) {
        if (field in event.request.data) event.request.data[field] = "[redacted]";
      }
    }
  }
  return event;
}

// Sentry is entirely optional — if SENTRY_DSN isn't set (e.g. running
// locally without bothering to configure it), this does nothing rather
// than crashing the app. Error monitoring should never be a requirement
// just to run the project.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    // Fraction of requests to trace for performance monitoring. Kept low —
    // this project only needs error capture, not full performance tracing.
    tracesSampleRate: 0.2,
    // Explicit, not just relying on the default: don't attach IP addresses
    // or other personally-identifying request metadata automatically.
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
  console.log("Sentry error monitoring enabled.");
} else {
  console.log("SENTRY_DSN not set — Sentry error monitoring disabled.");
}