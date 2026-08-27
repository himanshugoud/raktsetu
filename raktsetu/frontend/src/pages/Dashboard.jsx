import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_BADGE = {
  pending: "badge-muted",
  donors_notified: "badge-amber",
  fulfilled: "badge-vital",
  expired: "badge-muted",
};

const STATUS_LABEL = {
  pending: "Pending",
  donors_notified: "Donors notified",
  fulfilled: "Fulfilled",
  expired: "Expired",
};

export default function Dashboard() {
  const { donor, updateDonor } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    client
      .get("/donors/me/history")
      .then((res) => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  async function toggleAvailability() {
    setToggling(true);
    try {
      const res = await client.patch("/donors/me/availability", { available: !donor.available });
      updateDonor(res.data);
    } finally {
      setToggling(false);
    }
  }

  function updateLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser doesn't support location sharing.");
      return;
    }
    setUpdatingLocation(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await client.patch("/donors/me/location", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          updateDonor(res.data);
          setLocationMessage("Location updated successfully.");
        } catch {
          setLocationMessage("Couldn't save your new location. Please try again.");
        } finally {
          setUpdatingLocation(false);
        }
      },
      () => {
        setLocationMessage("Couldn't get your current location. Please try again.");
        setUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  }

  if (!donor) return null;

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <span className="eyebrow">Your dashboard</span>
          <h1 className="font-display text-3xl font-semibold mt-1">Hi, {donor.name.split(" ")[0]}</h1>
        </div>
        <Link to="/requests/new" className="btn btn-primary">Raise emergency request</Link>
      </div>

      {/* Profile card */}
      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-crimson-50)] font-mono font-bold text-xl text-[var(--color-crimson-600)]">
            {donor.bloodType}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="font-medium">{donor.name}</div>
            <div className="text-sm text-[var(--color-ink-muted)]">{donor.city} · {donor.phone}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${donor.available ? "badge-vital" : "badge-muted"}`}>
              {donor.available ? "Available to donate" : "Not available"}
            </span>
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className="btn btn-secondary text-sm !py-1.5 !px-3 disabled:opacity-60"
            >
              {toggling ? "Updating…" : donor.available ? "Turn off" : "Turn on"}
            </button>
            <button
              onClick={updateLocation}
              disabled={updatingLocation}
              className="btn btn-secondary text-sm !py-1.5 !px-3 disabled:opacity-60"
            >
              {updatingLocation ? "Updating…" : "Update my location"}
            </button>
          </div>
        </div>
        {locationMessage && (
          <p className="text-xs text-[var(--color-ink-muted)] mt-3">{locationMessage}</p>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Requests you've been notified about</h2>

        {loadingHistory && (
          <div className="card p-8 text-center text-[var(--color-ink-muted)] text-sm">Loading…</div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-[var(--color-ink-muted)] text-sm">
              No alerts yet. When a compatible request appears near you, it'll show up here.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {history.map((h) => (
            <div key={h._id} className="card p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[var(--color-crimson-600)]">{h.bloodType}</span>
                  <span className="text-sm font-medium">{h.hospitalName}</span>
                </div>
                <div className="text-xs text-[var(--color-ink-faint)] mt-1">
                  {h.distanceKm != null ? `${h.distanceKm.toFixed(1)} km away` : ""} ·{" "}
                  {new Date(h.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[h.status] || "badge-muted"}`}>
                {STATUS_LABEL[h.status] || h.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}