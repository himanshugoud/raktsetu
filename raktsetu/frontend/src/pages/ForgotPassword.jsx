import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const res = await client.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <span className="eyebrow">Locked out?</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-8">Reset your password</h1>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        {message && (
          <p className="text-sm text-[var(--color-ink)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting ? "Sending…" : "Send reset link"}
        </button>

        <p className="text-sm text-center text-[var(--color-ink-muted)]">
          Remembered it?{" "}
          <Link to="/login" className="text-[var(--color-crimson-600)] font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}