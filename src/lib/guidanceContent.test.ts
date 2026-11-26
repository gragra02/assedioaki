import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_EMERGENCY_CHANNELS,
  PRIVACY_TRUTHS
} from './guidanceContent';

test('OFFICIAL_EMERGENCY_CHANNELS includes 190, 180 and 181 with valid hrefs', () => {
  const numbers = OFFICIAL_EMERGENCY_CHANNELS.map(c => c.numberOrLabel);
  assert.ok(numbers.includes('190'));
  assert.ok(numbers.includes('180'));
  assert.ok(numbers.includes('181'));
  for (const ch of OFFICIAL_EMERGENCY_CHANNELS) {
    assert.ok(ch.href.startsWith('tel:') || ch.href.startsWith('https://'));
  }
});

test('PRIVACY_TRUTHS contains clear privacy explanations', () => {
  assert.ok(PRIVACY_TRUTHS.length >= 3);
  for (const item of PRIVACY_TRUTHS) {
    assert.ok(item.title.length > 0);
    assert.ok(item.text.length > 0);
  }
});
