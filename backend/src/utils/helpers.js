// ??$$$ General helper utilities for geospatial calculations and anomaly detection

/**
 * Calculate distance between two lat/lon points using the Haversine formula (km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a point is within a geofence (circle)
 */
const isWithinGeofence = (lat, lon, centerLat, centerLon, radiusKm) => {
  const dist = haversineDistance(lat, lon, centerLat, centerLon);
  return dist <= radiusKm;
};

/**
 * Detect fuel anomaly: returns true if claimed fuel is more than 20% above calculated expected
 */
const detectFuelAnomaly = (distanceKm, fuelEfficiency, claimedLiters) => {
  const expectedLiters = distanceKm * fuelEfficiency;
  const threshold = expectedLiters * 1.2; // 20% tolerance
  return claimedLiters > threshold;
};

/**
 * Calculate anomaly score for a route: higher score = more suspicious
 */
const calculateRouteAnomalyScore = (plannedDistanceKm, actualDistanceKm) => {
  if (!plannedDistanceKm || plannedDistanceKm === 0) return 0;
  const deviation = ((actualDistanceKm - plannedDistanceKm) / plannedDistanceKm) * 100;
  if (deviation <= 5) return 0;
  if (deviation <= 15) return 30;
  if (deviation <= 30) return 60;
  return 90;
};

/**
 * Update driver behavior score (deduct points for anomalies)
 */
const updateBehaviorScore = (currentScore, penaltyPoints) => {
  return Math.max(0, Math.min(100, currentScore - penaltyPoints));
};

module.exports = {
  haversineDistance,
  isWithinGeofence,
  detectFuelAnomaly,
  calculateRouteAnomalyScore,
  updateBehaviorScore,
};
