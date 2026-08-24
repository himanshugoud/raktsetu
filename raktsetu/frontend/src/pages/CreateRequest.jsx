import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client.js";

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const URGENCY = [
  { value: "critical", label: "Critical — needed now" },
  { value: "urgent", label: "Urgent — within hours" },
  { value: "scheduled", label: "Scheduled — planned procedure" },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName: "",
    bloodType: "",
    unitsNeeded: 1,
    hospitalName: "",
    contactPhone: "",
    urgency: "urgent",
    notes: "",
  });
  const [coords, setCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocStatus("error");
      return;
    }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocStatus("done");
      },
      () => setLocStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!coords) {
      setError("Please share the hospital's location so we can find nearby donors.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await client.post("/requests", { ...form, ...coords });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-vital-50)] flex items-center justify-center mx-auto mb-6">
          <span className="text-[var(--color-vital-600)] text-2xl">✓</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">Request sent</h1>
        <p className="text-[var(--color-ink-muted)] mb-8">
          {result.matchedDonors.length > 0
            ? `${result.matchedDonors.length} compatible donor${result.matchedDonors.length === 1 ? "" : "s"} nearby ${result.matchedDonors.length === 1 ? "has" : "have"} been notified by email, closest first.`
            : "No compatible donors were found within range right now. Consider widening the search or contacting your local blood bank directly."}
        </p>

        {result.matchedDonors.length > 0 && (
          <div className="card p-5 text-left mb-8">
            {result.matchedDonors.map((d) => (
              <div key={d._id} className="flex items-center justify-between py-2 border-b border-[var(--color-line)] last:border-0">
                <div>
                  <span className="font-medium text-sm">{d.name}</span>
                  <span className="text-xs text-[var(--color-ink-faint)] ml-2 font-mono">{d.bloodType}</span>
                </div>
                <span className="text-xs text-[var(--color-ink-muted)]">{d.distanceKm} km away</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      <span className="eyebrow">Emergency request</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-2">Request blood urgently</h1>
      <p className="text-[var(--color-ink-muted)] mb-8">
        We'll instantly find compatible, available donors within 10 km and email them.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="patientName">Patient name</label>
          <input id="patientName" required className="input" value={form.patientName}
            onChange={(e) => update("patientName", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="bloodType">Blood type needed</label>
            <select id="bloodType" required className="input font-mono" value={form.bloodType}
              onChange={(e) => update("bloodType", e.target.value)}>
              <option value="" disabled>Select</option>
              {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="unitsNeeded">Units needed</label>
            <input id="unitsNeeded" type="number" min={1} required className="input" value={form.unitsNeeded}
              onChange={(e) => update("unitsNeeded", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="hospitalName">Hospital name</label>
          <input id="hospitalName" required className="input" value={form.hospitalName}
            onChange={(e) => update("hospitalName", e.target.value)} placeholder="City Hospital, Indore" />
        </div>

        <div>
          <label className="label" htmlFor="contactPhone">Contact phone</label>
          <input id="contactPhone" required className="input" value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)} placeholder="+91 98765 43210" />
        </div>

        <div>
          <label className="label" htmlFor="urgency">Urgency</label>
          <select id="urgency" className="input" value={form.urgency}
            onChange={(e) => update("urgency", e.target.value)}>
            {URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" className="input" rows={3} value={form.notes}
            onChange={(e) => update("notes", e.target.value)} placeholder="Ward number, additional context…" />
        </div>

        <div>
          <label className="label">Hospital location</label>
          <button type="button" onClick={captureLocation} className="btn btn-secondary w-full text-sm">
            {locStatus === "locating" && "Getting location…"}
            {locStatus === "done" && "✓ Location captured"}
            {(locStatus === "idle" || locStatus === "error") && "Share hospital's current location"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting ? "Finding donors…" : "Send emergency request"}
        </button>
      </form>
    </div>
  );
}
