import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await client.post("/auth/login", { email, password });
      login(res.data.token, res.data.donor);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <span className="eyebrow">{t("login_eyebrow")}</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-8">{t("login_title")}</h1>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="email">{t("field_email")}</label>
          <input id="email" type="email" required className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">{t("field_password")}</label>
          <input id="password" type="password" required className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-xs text-[var(--color-crimson-600)]">
              {t("login_forgot")}
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting ? t("login_submitting") : t("login_title")}
        </button>

        <p className="text-sm text-center text-[var(--color-ink-muted)]">
          {t("login_new_here")}{" "}
          <Link to="/register" className="text-[var(--color-crimson-600)] font-medium">{t("register_as_donor")}</Link>
        </p>
      </form>
    </div>
  );
}