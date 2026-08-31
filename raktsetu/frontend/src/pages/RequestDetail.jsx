import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const POLL_INTERVAL_MS = 10000;

export default function RequestDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { donor } = useAuth();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(null);
  const [justAccepted, setJustAccepted] = useState(null); // name of donor who just said yes
  const prevDonorsRef = useRef(null);

  function fetchRequest() {
    return client
      .get(`/requests/${id}`)
      .then((res) => {
        const data = res.data;

        // Detect a donor flipping from pending -> accepted since the last
        // poll, so the requester gets a visible nudge instead of having to
        // notice a quiet list change themselves.
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
    // Live-ish status updates: the requester's view quietly re-checks every
    // few seconds so they don't have to manually refresh to see if help is
    // on the way.
    const interval = setInterval(fetchRequest, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id]);

  async function respond(response) {
    setResponding(true);
    try {
      await client.patch(`/requests/${id}/respond`, { response });
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
        {request.bloodType} needed at {request.hospitalName}
      </h1>

      {justAccepted && (
        <div className="rounded-xl bg-[var(--color-vital-50)] text-[var(--color-vital-700)] text-sm font-medium px-4 py-3 mb-6 text-center">
          🎉 {justAccepted} just accepted your request!
        </div>
      )}

      <div className="card p-6 space-y-3 mb-8">
        <Row label="Patient" value={request.patientName} />
        <Row label="Units needed" value={request.unitsNeeded} />
        <Row label="Contact" value={request.contactPhone} />
        {request.notes && <Row label="Notes" value={request.notes} />}
        <Row label="Status" value={request.status.replace("_", " ")} />
        {request.searchRadiusKm && (
          <Row label="Search radius" value={`${request.searchRadiusKm} km`} />
        )}
      </div>

      {isRequester ? (
        <NotifiedDonorsList donors={request.notifiedDonors} />
      ) : (
        <>
          {responded ? (
            <p className="text-center font-medium text-[var(--color-vital-600)]">
              {responded === "accepted"
                ? "Thanks — you've accepted. Please contact the hospital directly to coordinate."
                : "You've declined this request. Thank you for letting us know."}
            </p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => respond("accepted")}
                disabled={responding}
                className="btn btn-primary flex-1 disabled:opacity-60"
              >
                I can help
              </button>
              <button
                onClick={() => respond("declined")}
                disabled={responding}
                className="btn btn-secondary flex-1 disabled:opacity-60"
              >
                Can't right now
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotifiedDonorsList({ donors }) {
  if (!donors) return null;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-1">Notified donors</h2>
      <p className="text-xs text-[var(--color-ink-muted)] mb-4">
        Don't wait on email — call directly if this is urgent. Sorted nearest first. This page updates automatically.
      </p>

      {donors.length === 0 && (
        <div className="card p-6 text-center text-sm text-[var(--color-ink-muted)]">
          No compatible donors were found within range.
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
                {d.distanceKm.toFixed(1)} km away ·{" "}
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
                    ? "Accepted"
                    : d.response === "declined"
                    ? "Declined"
                    : "Awaiting response"}
                </span>
                {d.totalDonations > 0 && (
                  <> · Helped {d.totalDonations} {d.totalDonations === 1 ? "time" : "times"} before</>
                )}
              </div>
            </div>
            {d.phone && (
              <a
                href={`tel:${d.phone}`}
                className="btn btn-primary text-sm !py-1.5 !px-3 whitespace-nowrap"
              >
                Call {d.phone}
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
