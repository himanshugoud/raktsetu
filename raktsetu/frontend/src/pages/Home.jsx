import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PulseLine from "../components/PulseLine.jsx";
import CompatibilityGrid from "../components/CompatibilityGrid.jsx";

const STEPS = [
  {
    n: "01",
    title: "Register your blood type & location",
    body: "Sign up once with your blood type and city. We store only a location point — enough to calculate distance, never to track you.",
  },
  {
    n: "02",
    title: "A request comes in nearby",
    body: "When someone urgently needs blood, RaktSetu checks the request's type against the medical compatibility rules — not just an exact match.",
  },
  {
    n: "03",
    title: "You get an alert, if you're eligible",
    body: "Only compatible, available donors within the search radius are emailed — sorted by distance, so the closest donor hears first.",
  },
];

const VITALS = [
  { label: "Blood types tracked", value: "8" },
  { label: "Match radius", value: "10 km" },
  { label: "Avg. alert time", value: "< 30 sec" },
];

export default function Home() {
  const { donor } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
        <div className="max-w-2xl">
          <span className="eyebrow">Emergency blood donor network</span>
          <h1 className="font-display text-[2.75rem] sm:text-6xl font-semibold leading-[1.05] mt-3 text-[var(--color-ink)]">
            A pulse, when someone
            <br />
            <span className="text-[var(--color-crimson-500)]">needs one most.</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-ink-muted)] leading-relaxed">
            RaktSetu finds compatible, nearby blood donors the moment an emergency
            request comes in — and notifies them before it's too late to matter.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {donor ? (
              <Link to="/requests/new" className="btn btn-primary">
                Raise an emergency request
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                Register as a donor
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-secondary">
              {donor ? "Go to dashboard" : "See how matching works"}
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
        <span className="eyebrow">How it works</span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 mb-10">
          From request to responder, in three steps
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
            Someone nearby might need your type today.
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted)] max-w-lg mx-auto">
            Registration takes under two minutes. You choose when you're available —
            toggle it off anytime.
          </p>
          <Link to="/register" className="btn btn-primary mt-8">
            Join as a donor
          </Link>
        </div>
      </section>
    </div>
  );
}
