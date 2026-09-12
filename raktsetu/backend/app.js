import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import donorRoutes from "./routes/donors.js";
import requestRoutes from "./routes/requests.js";
import statsRoutes from "./routes/stats.js";

// The Express app itself, with no database connection and no app.listen().
// Kept separate from server.js so tests can import this directly, mount it
// on supertest, and exercise real routes against an in-memory database —
// without ever binding a real network port or touching a real database.
const app = express();

// Sets standard security-related HTTP headers (protects against clickjacking,
// MIME-sniffing, and a few other common attack vectors). Applied before
// anything else so every response — including errors — gets these headers.
app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Basic abuse protection — generous enough to never bother a real person,
// tight enough to stop scripted spam. Counted per IP address.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 signup/login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "raktsetu-api" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes); // rate limit for POST / lives inside requests.js itself
app.use("/api/stats", statsRoutes);

// Fallback 404
app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;