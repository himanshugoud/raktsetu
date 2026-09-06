// Reverse geocoding via OpenStreetMap's Nominatim — free, no API key needed.
// Called only at registration / location-update time (not on every match),
// so this stays well within Nominatim's usage policy (max ~1 request/sec).
// See: https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

// Most-specific-first: prefer a neighbourhood/suburb name over the whole
// city, so "near Indrapuri Colony" reads better than just repeating the
// city name the donor already typed in.
const LOCALITY_FIELDS = [
  "neighbourhood",
  "suburb",
  "city_district",
  "quarter",
  "residential",
  "road",
  "village",
  "town",
];

export async function reverseGeocode(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "16",
      addressdetails: "1",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(NOMINATIM_URL + "?" + params.toString(), {
      headers: {
        // Nominatim's usage policy requires an identifying User-Agent.
        "User-Agent": "RaktSetu/1.0 (blood donor network; contact: himanshugoud638@gmail.com)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const address = data.address || {};

    for (const field of LOCALITY_FIELDS) {
      if (address[field]) return address[field];
    }

    return null; // nothing specific enough found — not an error, just skip it
  } catch (err) {
    console.warn("Reverse geocoding failed (non-fatal):", err.message);
    return null;
  }
}