import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistanceKm, findNearestCenter, findNearestPair, formatDistance } from './geo';
import { SupportCenter } from '../types';

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
