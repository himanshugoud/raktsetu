import { useState } from "react";

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

const CAN_RECEIVE_FROM = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": BLOOD_TYPES,
};

// This grid mirrors the exact compatibility logic running on the server —
// pick a recipient type and see which donor types light up.
export default function CompatibilityGrid() {
  const [recipient, setRecipient] = useState("AB+");
  const donors = CAN_RECEIVE_FROM[recipient];

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <span className="eyebrow">Compatibility check</span>
          <h3 className="font-display text-2xl font-semibold mt-1">Who can donate to whom</h3>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="recipient-select" className="text-sm text-[var(--color-ink-muted)]">
            Patient needs
          </label>
          <select
            id="recipient-select"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="input w-auto font-mono font-medium"
          >
            {BLOOD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {BLOOD_TYPES.map((type) => {
          const isMatch = donors.includes(type);
          const isSelf = type === recipient;
          return (
            <div
              key={type}
              className={`relative flex flex-col items-center justify-center aspect-square rounded-xl font-mono font-semibold text-sm transition-all duration-200 border ${
                isMatch
                  ? "bg-[var(--color-vital-50)] border-[var(--color-vital-500)] text-[var(--color-vital-600)] scale-100"
                  : "bg-[var(--color-bg)] border-[var(--color-line)] text-[var(--color-ink-faint)] scale-95 opacity-60"
              }`}
            >
              {type}
              {isSelf && (
                <span className="absolute -top-2 -right-2 badge badge-crimson !px-1.5 !py-0.5 text-[10px]">
                  needs
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-[var(--color-ink-muted)]">
        <span className="font-medium text-[var(--color-vital-600)]">{donors.length} of 8 types</span> can
        safely donate to a <span className="font-mono font-medium text-[var(--color-ink)]">{recipient}</span>{" "}
        patient. RaktSetu applies this exact rule set before a single alert email goes out.
      </p>
    </div>
  );
}
