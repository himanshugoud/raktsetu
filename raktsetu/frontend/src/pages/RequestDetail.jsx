import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import client from "../api/client.js";

export default function RequestDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(null);

  useEffect(() => {
    client
      .get(`/requests/${id}`)
      .then((res) => setRequest(res.data))
      .catch((err) => setError(err.response?.data?.message || "Couldn't load this request."));
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

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <span className="eyebrow">{request.urgency}</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-6">
        {request.bloodType} needed at {request.hospitalName}
      </h1>

      <div className="card p-6 space-y-3 mb-8">
        <Row label="Patient" value={request.patientName} />
        <Row label="Units needed" value={request.unitsNeeded} />
        <Row label="Contact" value={request.contactPhone} />
        {request.notes && <Row label="Notes" value={request.notes} />}
        <Row label="Status" value={request.status.replace("_", " ")} />
      </div>

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
