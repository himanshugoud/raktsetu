import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bloodType: "",
    city: "",
  });
  const [coords, setCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle | locating | done | error
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocStatus("error");
      setError("Your browser doesn't support geolocation. Location is required to match you to nearby requests.");
      return;
    }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocStatus("done");
      },
      () => {
        setLocStatus("error");
        setError("Couldn't get your location. Please allow location access and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!coords) {
      setError("Please share your location so we can match you to nearby requests.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.post("/auth/register", { ...form, ...coords });
      login(res.data.token, res.data.donor);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <span className="eyebrow">Join the network</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-8">Register as a donor</h1>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" required className="input" value={form.name}
            onChange={(e) => update("name", e.target.value)} placeholder="Ananya Sharma" />
        </div>

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="input" value={form.email}
            onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} className="input" value={form.password}
            onChange={(e) => update("password", e.target.value)} placeholder="At least 6 characters" />
        </div>

        <div>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" required className="input" value={form.phone}
            onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="bloodType">Blood type</label>
            <select id="bloodType" required className="input font-mono" value={form.bloodType}
              onChange={(e) => update("bloodType", e.target.value)}>
              <option value="" disabled>Select</option>
              {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city">City</label>
            <input id="city" required className="input" value={form.city}
              onChange={(e) => update("city", e.target.value)} placeholder="Indore" />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <button type="button" onClick={captureLocation} className="btn btn-secondary w-full text-sm">
            {locStatus === "locating" && "Getting your location…"}
            {locStatus === "done" && "✓ Location captured"}
            {(locStatus === "idle" || locStatus === "error") && "Share my current location"}
          </button>
          <p className="text-xs text-[var(--color-ink-faint)] mt-2">
            Used only to calculate distance to emergency requests near you.
          </p>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-crimson-600)] bg-[var(--color-crimson-50)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-sm text-center text-[var(--color-ink-muted)]">
          Already registered?{" "}
          <Link to="/login" className="text-[var(--color-crimson-600)] font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}
