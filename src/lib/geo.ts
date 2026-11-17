import { Report, ReportLocationMode, RiskLevel, SupportCenter } from '../types';

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

/**
 * ~660m spatial quantization grid so exact GPS coordinates are never exposed or stored.
 */
export const PRIVACY_GRID_STEP = 0.006;

export function quantizeCoordinate(coord: number, step: number = PRIVACY_GRID_STEP): number {
  if (!Number.isFinite(coord)) return coord;
  return Number((Math.round(coord / step) * step).toFixed(4));
}

export type FictitiousSectorId = 'centro' | 'norte' | 'sul' | 'leste' | 'oeste';

export const FICTITIOUS_SECTORS: Array<{
  id: FictitiousSectorId;
  label: string;
  dLat: number;
  dLng: number;
}> = [
  { id: 'centro', label: 'Região Central (aproximada)', dLat: 0, dLng: 0 },
  { id: 'norte', label: 'Região Norte do município', dLat: 0.012, dLng: 0.004 },
  { id: 'sul', label: 'Região Sul do município', dLat: -0.012, dLng: -0.004 },
  { id: 'leste', label: 'Região Leste do município', dLat: 0.003, dLng: 0.012 },
  { id: 'oeste', label: 'Região Oeste do município', dLat: -0.003, dLng: -0.012 }
];

export function stripCoordinateStrings(text: string): string {
  return text
    .replace(/Localização\s*GPS\s*\([^)]*\)/gi, '')
    .replace(/-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}/g, '')
    .trim();
}

export interface SanitizedLocationInput {
  mode: ReportLocationMode;
  city: string;
  cityCoordinates: [number, number];
  address: string;
  gpsLat?: number;
  gpsLng?: number;
  fictitiousSector?: FictitiousSectorId;
}

export interface SanitizedLocationResult {
  locationMode: ReportLocationMode;
  city: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Produces privacy-safe coordinates and address text.
 * - In 'fictitious' mode, ignores any device GPS coordinates completely and uses only the chosen city + approximate sector.
 * - In 'real_approximate' mode, snaps GPS coordinates onto a ~660m grid and strips raw coordinates from address text.
 */
export function sanitizeLocationForPrivacy(input: SanitizedLocationInput): SanitizedLocationResult {
  const cleanAddress = stripCoordinateStrings(input.address || '');

  if (input.mode === 'fictitious') {
    const sector = FICTITIOUS_SECTORS.find((s) => s.id === input.fictitiousSector) || FICTITIOUS_SECTORS[0];
    const lat = quantizeCoordinate(input.cityCoordinates[0] + sector.dLat);
    const lng = quantizeCoordinate(input.cityCoordinates[1] + sector.dLng);
    const fallbackLabel = `${sector.label} — ${input.city}`;
    return {
      locationMode: 'fictitious',
      city: input.city,
      address: cleanAddress || fallbackLabel,
      lat,
      lng
    };
  }

  const baseLat = typeof input.gpsLat === 'number' && Number.isFinite(input.gpsLat)
    ? input.gpsLat
    : input.cityCoordinates[0];
  const baseLng = typeof input.gpsLng === 'number' && Number.isFinite(input.gpsLng)
    ? input.gpsLng
    : input.cityCoordinates[1];

  return {
    locationMode: 'real_approximate',
    city: input.city,
    address: cleanAddress || `Área aproximada em ${input.city} (~600 m)`,
    lat: quantizeCoordinate(baseLat),
    lng: quantizeCoordinate(baseLng)
  };
}

export interface PrivacyCluster {
  id: string;
  lat: number;
  lng: number;
  reports: Report[];
  count: number;
  highestRisk: RiskLevel;
  address: string;
  city: string;
  isSingleGeneralized: boolean;
}

const RISK_PRIORITY: Record<string, number> = {
  grave: 4,
  urgente: 4,
  alto: 3,
  moderado: 2,
  medio: 2,
  leve: 1,
  baixo: 1
};

export function clusterReportsByProximity(
  reports: Report[],
  thresholdDeg: number = 0.008
): PrivacyCluster[] {
  const clusters: PrivacyCluster[] = [];

  for (const report of reports) {
    const approxLat = quantizeCoordinate(report.lat);
    const approxLng = quantizeCoordinate(report.lng);

    const existing = clusters.find((c) => {
      return Math.abs(c.lat - approxLat) <= thresholdDeg && Math.abs(c.lng - approxLng) <= thresholdDeg;
    });

    if (existing) {
      existing.reports.push(report);
      existing.count += 1;
      existing.isSingleGeneralized = existing.count < 2;
      if ((RISK_PRIORITY[report.riskLevel] || 1) > (RISK_PRIORITY[existing.highestRisk] || 1)) {
        existing.highestRisk = report.riskLevel;
      }
    } else {
      clusters.push({
        id: `cluster-${report.id}`,
        lat: approxLat,
        lng: approxLng,
        reports: [report],
        count: 1,
        highestRisk: report.riskLevel,
        address: report.address,
        city: report.city,
        isSingleGeneralized: true
      });
    }
  }

  return clusters;
}

export const INITIAL_DEMO_REPORT_IDS = new Set([
  'ASK-2026-66520',
  'ASK-2026-90412',
  'ASK-2026-77319',
  'ASK-2026-44102',
  'ASK-2026-11823',
  'ASK-2026-33829',
  'ASK-2026-15501',
  'ASK-2026-78921'
]);

export function isDemoExampleReport(report: Report): boolean {
  return INITIAL_DEMO_REPORT_IDS.has(report.id);
}

