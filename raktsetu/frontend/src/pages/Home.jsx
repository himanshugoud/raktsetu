import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import PulseLine from "../components/PulseLine.jsx";
import CompatibilityGrid from "../components/CompatibilityGrid.jsx";

export default function Home() {
  const { donor } = useAuth();
  const { t } = useLanguage();

  const STEPS = [
    { n: "01", title: t("step1_title"), body: t("step1_body") },
    { n: "02", title: t("step2_title"), body: t("step2_body") },
    { n: "03", title: t("step3_title"), body: t("step3_body") },
  ];

  const VITALS = [
    { label: t("vital_blood_types"), value: "8" },
    { label: t("vital_radius"), value: "10 km" },
    { label: t("vital_alert_time"), value: "< 30 sec" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
        <div className="max-w-2xl">
          <span className="eyebrow">{t("home_eyebrow")}</span>
          <h1 className="font-display text-[2.75rem] sm:text-6xl font-semibold leading-[1.05] mt-3 text-[var(--color-ink)]">
            {t("home_headline_1")}
            <br />
            <span className="text-[var(--color-crimson-500)]">{t("home_headline_2")}</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-ink-muted)] leading-relaxed">
            {t("home_subtext")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {donor ? (
              <Link to="/requests/new" className="btn btn-primary">
                {t("home_cta_raise")}
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                {t("home_cta_register")}
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-secondary">
              {donor ? t("home_cta_dashboard") : t("home_cta_see_matching")}
            </Link>
          </div>
        </div>
      </section>

      <PulseLine />

      {/* Vitals strip */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {VITALS.map((v) => (
          <div key={v.label} className="card p-6">
            <div className="font-mono text-3xl font-semibold text-[var(--color-crimson-600)]">{v.value}</div>
            <div className="mt-1 text-sm text-[var(--color-ink-muted)]">{v.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <span className="eyebrow">{t("home_how_it_works")}</span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 mb-10">
          {t("home_how_it_works_sub")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="relative pl-0">
              <div className="font-mono text-sm text-[var(--color-crimson-500)] mb-3">{s.n}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-[var(--color-ink-muted)] text-[0.95rem] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compatibility grid */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <CompatibilityGrid />
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="card p-10 sm:p-14 text-center bg-gradient-to-b from-[var(--color-crimson-50)] to-[var(--color-surface)] border-[var(--color-crimson-100)]">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            {t("home_cta_heading")}
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted)] max-w-lg mx-auto">
            {t("home_cta_body")}
          </p>
          <Link to="/register" className="btn btn-primary mt-8">
            {t("home_cta_join")}
          </Link>
        </div>
      </section>
    </div>
  );
}