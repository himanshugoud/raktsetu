import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import client from "../api/client.js";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Impact() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError(t("impact_error")));
  }, [t]);

  const STATUS_KEYS = ["pending", "donors_notified", "fulfilled", "expired"];
  const statusData = stats
    ? STATUS_KEYS.map((key) => ({
        name: t(`status_${key}`),
        count: stats.requestsByStatus[key] ?? 0,
      }))
    : [];

  const SUMMARY_CARDS = stats
    ? [
        { label: t("impact_registered_donors"), value: stats.donorCount },
        { label: t("impact_requests_raised"), value: stats.totalRequests },
        { label: t("impact_requests_fulfilled"), value: stats.fulfilledRequests },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <span className="eyebrow">{t("impact_eyebrow")}</span>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold mt-3 text-[var(--color-ink)]">
        {t("impact_headline")}
      </h1>
      <p className="mt-4 text-lg text-[var(--color-ink-muted)] max-w-2xl">{t("impact_subtext")}</p>

      {error && (
        <p role="alert" className="mt-8 text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!stats && !error && (
        <p className="mt-8 text-[var(--color-ink-muted)]">{t("impact_loading")}</p>
      )}

      {stats && (
        <>
          {/* Summary cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUMMARY_CARDS.map((c) => (
              <div key={c.label} className="card p-6">
                <div className="font-mono text-3xl font-semibold text-[var(--color-crimson-600)]">{c.value}</div>
                <div className="mt-1 text-sm text-[var(--color-ink-muted)]">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Donor growth over time */}
          <div className="card p-6 sm:p-8 mt-6">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              {t("impact_donor_growth_title")}
            </h2>
            {stats.donorGrowth.length < 2 ? (
              <p className="mt-4 text-sm text-[var(--color-ink-muted)]">{t("impact_donor_growth_empty")}</p>
            ) : (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.donorGrowth} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
                    <Tooltip
                      contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: "8px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="donors"
                      name={t("impact_chart_donors_label")}
                      stroke="var(--color-crimson-500)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Requests by status */}
          <div className="card p-6 sm:p-8 mt-6">
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
              {t("impact_status_title")}
            </h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="var(--color-vital-500)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
