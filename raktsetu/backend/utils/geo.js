const EARTH_RADIUS_KM = 6371;

// Haversine great-circle distance between two [lng, lat] points, in km.
export function distanceKm([lng1, lat1], [lng2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// Builds the ladder of search radii to try, in order: the radius the
// requester actually asked for, then each standard escalation step that's
// larger than it. Keeps a request from dead-ending just because the first,
// smallest radius came up empty.
export function buildRadiusSteps(requestedRadiusKm, escalationStepsKm) {
  return [requestedRadiusKm, ...escalationStepsKm.filter((s) => s > requestedRadiusKm)];
}

export default { distanceKm, buildRadiusSteps };
