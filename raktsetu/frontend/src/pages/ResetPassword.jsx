import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client.js";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await client.post("/auth/reset-password", { email, token, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-[var(--color-ink-muted)]">
          {t("reset_link_incomplete")}{" "}
          <Link to="/forgot-password" className="text-[var(--color-crimson-600)] font-medium">
            {t("forgot_password_page_link")}
          </Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <span className="eyebrow">{t("almost_there")}</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-8">{t("choose_new_password")}</h1>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="password">{t("field_new_password")}</label>
          <input id="password" type="password" required minLength={6} className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">{t("field_confirm_password")}</label>
          <input id="confirmPassword" type="password" required minLength={6} className="input" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password" />
        </div>

        {error && (
          <p role="alert" className="text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting ? t("saving_password") : t("save_new_password")}
        </button>
      </form>
    </div>
  );
}