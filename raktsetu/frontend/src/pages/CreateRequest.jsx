import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export default function CreateRequest() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const URGENCY = [
    { value: "critical", label: t("urgency_critical") },
    { value: "urgent", label: t("urgency_urgent") },
    { value: "scheduled", label: t("urgency_scheduled") },
  ];

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
  const [usedDemoLocation, setUsedDemoLocation] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function useDemoLocation() {
    setCoords({ latitude: 28.6129, longitude: 77.2295 });
    setUsedDemoLocation(true);
    setLocStatus("done");
    setError("");
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocStatus("error");
      setError("Your browser doesn't support location sharing. Please try a different browser.");
      return;
    }
    setLocStatus("locating");
    setError("");

    function onError(err) {
      setLocStatus("error");
      if (err.code === err.PERMISSION_DENIED) {
        setError("Location permission was denied. Please allow location access for this site in your browser settings, then try again.");
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setError("Your location couldn't be determined. Make sure location services are turned on for your device and browser.");
      } else if (err.code === err.TIMEOUT) {
        setError("Getting your location took too long. Please try again, ideally near a window or outdoors.");
      } else {
        setError("Something went wrong while getting your location. Please try again.");
      }
    }

    function onSuccess(pos) {
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setUsedDemoLocation(false);
      setLocStatus("done");
      setError("");
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onError,
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 20000 }
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

  function matchSummaryText() {
    const n = result.matchedDonors.length;
    if (n === 0) {
      return lang === "hi"
        ? "अभी इस दायरे में कोई अनुकूल दाता नहीं मिला। दायरा बढ़ाने या सीधे अपने नज़दीकी ब्लड बैंक से संपर्क करने पर विचार करें।"
        : "No compatible donors were found within range right now. Consider widening the search or contacting your local blood bank directly.";
    }
    if (lang === "hi") {
      return n + " अनुकूल दाता आपके पास सूचित किए जा चुके हैं (दूरी के अनुसार), नज़दीकी दाता पहले।";
    }
    return n + " compatible donor" + (n === 1 ? "" : "s") + " nearby " + (n === 1 ? "has" : "have") + " been notified by email, closest first.";
  }

  function widenedRadiusText() {
    if (lang === "hi") {
      return "10 किमी में कोई उपलब्ध नहीं था, इसलिए हमने खोज का दायरा " + result.radiusUsedKm + " किमी तक बढ़ा दिया।";
    }
    return "No one was available within 10 km, so we widened the search to " + result.radiusUsedKm + " km.";
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-vital-50)] flex items-center justify-center mx-auto mb-6">
          <span className="text-[var(--color-vital-600)] text-2xl">&#10003;</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">{t("result_sent_title")}</h1>
        <p className="text-[var(--color-ink-muted)] mb-8">
          {matchSummaryText()}
          {result.radiusUsedKm && result.radiusUsedKm > 10 && result.matchedDonors.length > 0 && (
            <span className="block mt-1 text-xs">
              {widenedRadiusText()}
            </span>
          )}
        </p>

        {result.matchedDonors.length > 0 && (
          <div className="card p-5 text-left mb-8">
            <p className="text-xs text-[var(--color-ink-muted)] mb-3">
              {t("result_no_email_text")}
            </p>
            <p className="text-xs text-[var(--color-ink-faint)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2 mb-3">
              {t("result_demo_note")}
            </p>
            {result.matchedDonors.map((d) => (
              <div key={d._id} className="flex items-center justify-between gap-3 py-3 border-b border-[var(--color-line)] last:border-0">
                <div>
                  <span className="font-medium text-sm">{d.name}</span>
                  <span className="text-xs text-[var(--color-ink-faint)] ml-2 font-mono">{d.bloodType}</span>
                  <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {d.distanceKm} {t("km_away")}
                    {d.totalDonations > 0 && <> &middot; {t("helped_before")} {d.totalDonations} {t("times_before")}</>}
                  </div>
                </div>
                                {d.phone && (
                  <a href={"tel:" + d.phone}
                    className="btn btn-primary text-sm !py-1.5 !px-3 whitespace-nowrap"
                  >
                    {t("call_word")} {d.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/requests/" + result.request._id)} className="btn btn-secondary">
            {t("result_view_request")}
          </button>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
            {t("home_cta_dashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      <span className="eyebrow">{t("request_eyebrow")}</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-2">{t("request_title")}</h1>
      <p className="text-[var(--color-ink-muted)] mb-8">
        {t("request_subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="patientName">{t("field_patient_name")}</label>
          <input id="patientName" required className="input" value={form.patientName}
            onChange={(e) => update("patientName", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="bloodType">{t("field_blood_type_needed")}</label>
            <select id="bloodType" required className="input font-mono" value={form.bloodType}
              onChange={(e) => update("bloodType", e.target.value)}>
              <option value="" disabled>{t("field_select")}</option>
              {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="unitsNeeded">{t("field_units_needed")}</label>
            <input id="unitsNeeded" type="number" min={1} required className="input" value={form.unitsNeeded}
              onChange={(e) => update("unitsNeeded", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="hospitalName">{t("field_hospital_name")}</label>
          <input id="hospitalName" required className="input" value={form.hospitalName}
            onChange={(e) => update("hospitalName", e.target.value)} placeholder="City Hospital, Indore" />
        </div>

        <div>
          <label className="label" htmlFor="contactPhone">{t("field_contact_phone")}</label>
          <input id="contactPhone" required className="input" value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)} placeholder="+91 98765 43210" />
        </div>

        <div>
          <label className="label" htmlFor="urgency">{t("field_urgency")}</label>
          <select id="urgency" className="input" value={form.urgency}
            onChange={(e) => update("urgency", e.target.value)}>
            {URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="notes">{t("field_notes")}</label>
          <textarea id="notes" className="input" rows={3} value={form.notes}
            onChange={(e) => update("notes", e.target.value)} placeholder="Ward number, additional context..." />
        </div>

        <div>
          <label className="label">{t("field_hospital_location")}</label>
          <button type="button" onClick={captureLocation} className="btn btn-secondary w-full text-sm">
            {locStatus === "locating" && t("loc_getting_short")}
            {locStatus === "done" && !usedDemoLocation && t("loc_captured")}
            {(locStatus === "idle" || locStatus === "error") && t("loc_share_hospital")}
          </button>
          <button
            type="button"
            onClick={useDemoLocation}
            className="w-full text-xs text-[var(--color-ink-faint)] underline mt-2"
          >
            {usedDemoLocation ? t("demo_loc_using") : t("demo_loc_link")}
          </button>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting ? t("request_submitting") : t("request_submit")}
        </button>
      </form>
    </div>
  );
}