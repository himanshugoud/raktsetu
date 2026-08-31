import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SLOW_THRESHOLD_MS = 4000;

const client = axios.create({ baseURL: API_BASE_URL });

// The backend runs on a free tier that goes to sleep after inactivity, so
// the very first request after a while can take up to a minute to wake it
// back up. Rather than let that look like a frozen/broken app, we fire a
// global event once any request has been pending longer than a few
// seconds — a small banner (see SlowServerBanner.jsx) listens for this and
// tells the person what's actually happening.
let pendingCount = 0;
let slowTimer = null;

function requestStarted() {
  pendingCount += 1;
  if (!slowTimer) {
    slowTimer = setTimeout(() => {
      if (pendingCount > 0) {
        window.dispatchEvent(new CustomEvent("raktsetu:slow-request"));
      }
    }, SLOW_THRESHOLD_MS);
  }
}

function requestFinished() {
  pendingCount = Math.max(0, pendingCount - 1);
  if (pendingCount === 0) {
    clearTimeout(slowTimer);
    slowTimer = null;
    window.dispatchEvent(new CustomEvent("raktsetu:request-done"));
  }
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("raktsetu_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  requestStarted();
  return config;
});

client.interceptors.response.use(
  (res) => {
    requestFinished();
    return res;
  },
  (err) => {
    requestFinished();
    if (err.response?.status === 401) {
      localStorage.removeItem("raktsetu_token");
      localStorage.removeItem("raktsetu_donor");
    }
    return Promise.reject(err);
  }
);

export default client;
