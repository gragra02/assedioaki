import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOME_CARDS,
  HARASSMENT_GUIDE,
  OFFICIAL_EMERGENCY_CHANNELS,
  RIGHTS_GUIDE,
  PRIVACY_TRUTHS,
  filterHarassmentGuide
} from './guidanceContent';

test('HOME_CARDS contains the 4 core intuitive choices with clear labels', () => {
  assert.equal(HOME_CARDS.length, 4);
  assert.deepEqual(
    HOME_CARDS.map(c => c.title),
    [
      'PRECISO DE AJUDA',
      'QUERO ENTENDER O QUE ESTOU VIVENDO',
      'QUERO CONVERSAR',
      'CONHEÇA SEUS DIREITOS'
    ]
  );
});

test('OFFICIAL_EMERGENCY_CHANNELS includes 190, 180 and 181 with valid hrefs', () => {
  const numbers = OFFICIAL_EMERGENCY_CHANNELS.map(c => c.numberOrLabel);
  assert.ok(numbers.includes('190'));
  assert.ok(numbers.includes('180'));
  assert.ok(numbers.includes('181'));
  for (const ch of OFFICIAL_EMERGENCY_CHANNELS) {
    assert.ok(ch.href.startsWith('tel:') || ch.href.startsWith('https://'));
  }
});

test('filterHarassmentGuide matches by title, summary, or examples', () => {
  assert.equal(filterHarassmentGuide('').length, HARASSMENT_GUIDE.length);
  const busMatches = filterHarassmentGuide('ônibus');
  assert.ok(busMatches.some(item => item.id === 'importunacao_sexual'));
  const stalkingMatches = filterHarassmentGuide('perfis falsos');
  assert.ok(stalkingMatches.some(item => item.id === 'perseguicao'));
});

test('RIGHTS_GUIDE and PRIVACY_TRUTHS are non-empty and complete', () => {
  assert.ok(RIGHTS_GUIDE.length >= 4);
  assert.ok(PRIVACY_TRUTHS.length >= 3);
});
