import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const POLL_INTERVAL_MS = 10000;

export default function RequestDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { donor } = useAuth();
  const { t, lang } = useLanguage();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(null);
  const [justAccepted, setJustAccepted] = useState(null);
  const prevDonorsRef = useRef(null);

  function fetchRequest() {
    return client
      .get("/requests/" + id)
      .then((res) => {
        const data = res.data;

        if (Array.isArray(data.notifiedDonors) && prevDonorsRef.current) {
          for (const d of data.notifiedDonors) {
            const prev = prevDonorsRef.current.find((p) => p.donorId === d.donorId);
            if (prev && prev.response === "pending" && d.response === "accepted") {
              setJustAccepted(d.name);
              setTimeout(() => setJustAccepted(null), 8000);
            }
          }
        }
        if (Array.isArray(data.notifiedDonors)) {
          prevDonorsRef.current = data.notifiedDonors;
        }

        setRequest(data);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load this request."));
  }

  useEffect(() => {
    fetchRequest();
    const interval = setInterval(fetchRequest, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id]);

  async function respond(response) {
    setResponding(true);
    try {
      await client.patch("/requests/" + id + "/respond", { response });
      setResponded(response);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your response.");
    } finally {
      setResponding(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("action") === "accept" && request && !responded) {
      // Pre-fill intent from the email link, but still require an explicit click.
    }
  }, [searchParams, request, responded]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-[var(--color-crimson-600)]">{error}</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 flex justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-crimson-500)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isRequester = donor && String(request.requestedBy?._id) === String(donor._id);

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <span className="eyebrow">{request.urgency}</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-6">
        {request.bloodType} {lang === "hi" ? "की ज़रूरत है" : "needed at"} {request.hospitalName}
      </h1>

      {justAccepted && (
        <div className="rounded-xl bg-[var(--color-vital-50)] text-[var(--color-vital-700)] text-sm font-medium px-4 py-3 mb-6 text-center">
          {"🎉 "}{justAccepted}{lang === "hi" ? " ने अभी आपका अनुरोध स्वीकार किया!" : " just accepted your request!"}
        </div>
      )}

      <div className="card p-6 space-y-3 mb-8">
        <Row label={t("row_patient")} value={request.patientName} />
        <Row label={t("row_units_needed")} value={request.unitsNeeded} />
        <Row label={t("row_contact")} value={request.contactPhone} />
        {request.notes && <Row label={t("row_notes")} value={request.notes} />}
        <Row label={t("row_status")} value={request.status.replace("_", " ")} />
        {request.searchRadiusKm && (
          <Row label={t("row_search_radius")} value={request.searchRadiusKm + " km"} />
        )}
      </div>

      {isRequester ? (
        <NotifiedDonorsList donors={request.notifiedDonors} t={t} />
      ) : (
        <>
          {responded ? (
            <p className="text-center font-medium text-[var(--color-vital-600)]">
              {responded === "accepted" ? t("accepted_thanks") : t("declined_thanks")}
            </p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => respond("accepted")}
                disabled={responding}
                className="btn btn-primary flex-1 disabled:opacity-60"
              >
                {t("btn_i_can_help")}
              </button>
              <button
                onClick={() => respond("declined")}
                disabled={responding}
                className="btn btn-secondary flex-1 disabled:opacity-60"
              >
                {t("btn_cant_now")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotifiedDonorsList({ donors, t }) {
  if (!donors) return null;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-1">{t("notified_donors_heading")}</h2>
      <p className="text-xs text-[var(--color-ink-muted)] mb-2">
        {t("notified_donors_note")}
      </p>
      <p className="text-xs text-[var(--color-ink-faint)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2 mb-4">
        {t("notified_donors_demo_note")}
      </p>

      {donors.length === 0 && (
        <div className="card p-6 text-center text-sm text-[var(--color-ink-muted)]">
          {t("no_donors_in_range")}
        </div>
      )}

      <div className="space-y-3">
        {donors.map((d) => (
          <div key={d.donorId} className="card p-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[var(--color-crimson-600)] text-sm">
                  {d.bloodType}
                </span>
                <span className="font-medium text-sm">{d.name}</span>
              </div>
                            <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">
                {d.distanceKm.toFixed(1)} {t("km_away")}
                {d.areaName && <> &middot; {t("near_word")} {d.areaName}</>} &middot;{" "}
                <span
                  className={
                    d.response === "accepted"
                      ? "text-[var(--color-vital-600)] font-medium"
                      : d.response === "declined"
                      ? "text-[var(--color-ink-faint)]"
                      : ""
                  }
                >
                  {d.response === "accepted"
                    ? t("donor_accepted_status")
                    : d.response === "declined"
                    ? t("donor_declined_status")
                    : t("donor_awaiting_status")}
                </span>
                {d.totalDonations > 0 && (
                  <> &middot; {t("helped_before")} {d.totalDonations} {t("times_before")}</>
                )}
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
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}