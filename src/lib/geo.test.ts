import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  findNearestCenter,
  findNearestPair,
  formatDistance,
  quantizeCoordinate,
  sanitizeLocationForPrivacy,
  clusterReportsByProximity,
  isDemoExampleReport
} from './geo';
import { Report, SupportCenter } from '../types';

const sampleCenters: SupportCenter[] = [
  {
    id: 'del-1',
    name: 'DPCAMI Florianópolis',
    type: 'delegacia',
    address: 'Rua Delminda da Silveira, 811',
    city: 'Florianópolis',
    state: 'SC',
    phone: '(48) 3665-6528',
    hours: '12h às 19h',
    lat: -27.5815,
    lng: -48.5340
  },
  {
    id: 'hosp-1',
    name: 'Maternidade Carmela Dutra',
    type: 'hospital',
    address: 'Rua Irmã Benwarda, 208',
    city: 'Florianópolis',
    state: 'SC',
    phone: '(48) 3251-7500',
    hours: '24h',
    lat: -27.5921,
    lng: -48.5524
  },
  {
    id: 'del-2',
    name: 'DPCAMI Joinville',
    type: 'delegacia',
    address: 'Rua Dr. Plácido Olímpio, 843',
    city: 'Joinville',
    state: 'SC',
    phone: '(47) 3481-3628',
    hours: '12h às 19h',
    lat: -26.3150,
    lng: -48.8415
  }
];

test('calculateDistanceKm returns 0 for identical coordinates and positive km for distinct points', () => {
  assert.equal(calculateDistanceKm(-27.59, -48.55, -27.59, -48.55), 0);
  const dist = calculateDistanceKm(-27.5954, -48.5480, -26.3044, -48.8487);
  assert.ok(dist > 140 && dist < 160, `Expected ~147 km, got ${dist}`);
});

test('findNearestCenter respects type filter and returns nearest unit', () => {
  const nearestDel = findNearestCenter(-27.5954, -48.5480, sampleCenters, 'delegacia');
  assert.ok(nearestDel);
  assert.equal(nearestDel.center.id, 'del-1');

  const nearestHosp = findNearestCenter(-27.5954, -48.5480, sampleCenters, 'hospital');
  assert.ok(nearestHosp);
  assert.equal(nearestHosp.center.id, 'hosp-1');
});

test('findNearestPair returns both nearest police station and hospital', () => {
  const pair = findNearestPair(-27.5954, -48.5480, sampleCenters);
  assert.equal(pair.nearestDelegacia?.center.id, 'del-1');
  assert.equal(pair.nearestHospital?.center.id, 'hosp-1');
});

test('formatDistance formats meters below 1 km and kilometers with comma above 1 km', () => {
  assert.equal(formatDistance(0.45), '450 m');
  assert.equal(formatDistance(2.34), '2,3 km');
});

test('quantizeCoordinate snaps exact GPS coords onto privacy grid', () => {
  const exactLat = -27.5948231;
  const snapped = quantizeCoordinate(exactLat);
  assert.notEqual(snapped, exactLat);
  assert.ok(Math.abs(snapped - exactLat) <= 0.0035);
});

test('sanitizeLocationForPrivacy strictly ignores device GPS in fictitious mode and strips raw GPS strings', () => {
  const result = sanitizeLocationForPrivacy({
    mode: 'fictitious',
    city: 'Chapecó',
    cityCoordinates: [-27.1004, -52.6152],
    address: 'Localização GPS (-27.5954, -48.5480)',
    gpsLat: -27.5954,
    gpsLng: -48.548,
    fictitiousSector: 'norte'
  });

  assert.equal(result.locationMode, 'fictitious');
  assert.equal(result.city, 'Chapecó');
  // Must use Chapecó coords, NEVER Florianópolis device GPS coords
  assert.ok(Math.abs(result.lat - -27.1004) < 0.03);
  assert.ok(Math.abs(result.lng - -52.6152) < 0.03);
  assert.equal(result.address.includes('-27.5954'), false);
});

test('sanitizeLocationForPrivacy fuzzes coordinates in real_approximate mode and strips raw lat/lng text', () => {
  const result = sanitizeLocationForPrivacy({
    mode: 'real_approximate',
    city: 'Florianópolis',
    cityCoordinates: [-27.5954, -48.548],
    address: 'Centro -27.595412, -48.548011',
    gpsLat: -27.595412,
    gpsLng: -48.548011
  });

  assert.equal(result.locationMode, 'real_approximate');
  assert.notEqual(result.lat, -27.595412);
  assert.equal(result.address.includes('-27.595412'), false);
});

test('clusterReportsByProximity groups nearby incidents and flags single-report generalized regions', () => {
  const baseReport = (id: string, lat: number, lng: number, riskLevel: Report['riskLevel']): Report => ({
    id,
    accessKey: '1234',
    isAnonymous: true,
    title: 'Teste',
    category: 'importunacao_sexual',
    locationType: 'via_publica',
    address: 'Centro',
    city: 'Florianópolis',
    state: 'SC',
    lat,
    lng,
    dateTime: '2026-08-01T18:00',
    periodOfDay: 'noite',
    description: 'Teste',
    riskLevel,
    status: 'registrada',
    createdAt: '2026-08-01T18:00:00Z',
    updatedAt: '2026-08-01T18:00:00Z',
    timeline: []
  });

  const clusters = clusterReportsByProximity([
    baseReport('ASK-2026-99901', -27.596, -48.552, 'baixo'),
    baseReport('ASK-2026-99902', -27.597, -48.553, 'grave'),
    baseReport('ASK-2026-66520', -26.315, -48.841, 'medio')
  ]);

  assert.equal(clusters.length, 2);
  const flnCluster = clusters.find((c) => c.count === 2);
  const isolatedCluster = clusters.find((c) => c.count === 1);
  assert.ok(flnCluster);
  assert.equal(flnCluster.highestRisk, 'grave');
  assert.equal(flnCluster.isSingleGeneralized, false);
  assert.ok(isolatedCluster);
  assert.equal(isolatedCluster.isSingleGeneralized, true);
  assert.equal(isDemoExampleReport(isolatedCluster.reports[0]), true);
  assert.equal(isDemoExampleReport(flnCluster.reports[0]), false);
});
