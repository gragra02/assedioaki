import { SupportCenter } from '../types';

/**
 * Calculates distance in kilometers between two geographic coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearestResult {
  center: SupportCenter;
  distanceKm: number;
  walkingTimeMin: number;
  drivingTimeMin: number;
}

/**
 * Finds the nearest support center for a given type or all types
 */
export function findNearestCenter(
  userLat: number,
  userLng: number,
  centers: SupportCenter[],
  filterType?: 'delegacia' | 'hospital' | 'all'
): NearestResult | null {
  const filtered = centers.filter(c => {
    if (!filterType || filterType === 'all') return true;
    return c.type === filterType;
  });

  if (filtered.length === 0) return null;

  let bestResult: NearestResult | null = null;

  for (const center of filtered) {
    const dist = calculateDistanceKm(userLat, userLng, center.lat, center.lng);
    if (!bestResult || dist < bestResult.distanceKm) {
      bestResult = {
        center,
        distanceKm: dist,
        walkingTimeMin: Math.max(1, Math.round((dist / 4.5) * 60)), // ~4.5 km/h walking speed
        drivingTimeMin: Math.max(1, Math.round((dist / 35) * 60))   // ~35 km/h urban driving
      };
    }
  }

  return bestResult;
}

/**
 * Finds both the nearest police station (delegacia) and nearest hospital
 */
export function findNearestPair(
  userLat: number,
  userLng: number,
  centers: SupportCenter[]
): {
  nearestDelegacia: NearestResult | null;
  nearestHospital: NearestResult | null;
} {
  return {
    nearestDelegacia: findNearestCenter(userLat, userLng, centers, 'delegacia'),
    nearestHospital: findNearestCenter(userLat, userLng, centers, 'hospital')
  };
}

/**
 * Formats distance into a human-friendly string
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
}
