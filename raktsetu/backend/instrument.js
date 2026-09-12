import "dotenv/config";
import * as Sentry from "@sentry/node";

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
  });
  console.log("Sentry error monitoring enabled.");
} else {
  console.log("SENTRY_DSN not set — Sentry error monitoring disabled.");
}