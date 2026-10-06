'use strict';

const test = require('node:test');
const assert = require('node:assert');
const PlanetProfile = require('../src/PlanetProfile');
const { samplePlanet } = require('./helpers');

function profileFor(changes) {
  return new PlanetProfile(samplePlanet('size6.json', changes));
}

test('the size 6 sample is not agricultural or desert', () => {
  const profile = profileFor({});
  assert.ok(!profile.isAgricultural && !profile.isDesert);
});

test('hydrographics 0 with a thin atmosphere is a desert world', () => {
  assert.ok(profileFor({ hydrographics: { code: 0 } }).isDesert);
});

test('good atmosphere, water and population make an agricultural world', () => {
  assert.ok(profileFor({ hydrographics: { code: 6 }, population: { code: 6, cities: [] } }).isAgricultural);
});

test('thin air with water is ice-capped', () => {
  assert.ok(profileFor({ atmosphere: { code: 1 } }).isIceCapped);
  assert.ok(!profileFor({ atmosphere: { code: 6 } }).isIceCapped);
});

const EMPTY = { population: { code: 0, cities: [] }, government: { code: 0 }, law_level: { code: 0 } };

test('an empty world that still has a tech level has died back, and has ruins', () => {
  const profile = profileFor({ ...EMPTY, tech_level: { code: 8 } });
  assert.ok(profile.hasDiedBack && profile.hasRuins);
});

test('an empty world with tech level 0 has not died back', () => {
  const profile = profileFor({ ...EMPTY, tech_level: { code: 0 } });
  assert.ok(!profile.hasDiedBack && !profile.hasRuins);
});

test('an extinct sophont leaves ruins on an inhabited world', () => {
  assert.ok(profileFor({ extinct_sophont: true }).hasRuins);
});

test('the twilight zone needs a lock to a star', () => {
  const locked = { twilight_zone: true, tidal_lock: '1:1' };
  assert.ok(profileFor({ ...locked, tidal_lock_target_type: 'Star' }).twilightZone);
  assert.ok(!profileFor({ ...locked, tidal_lock_target_type: 'Planet' }).twilightZone);
  assert.ok(!profileFor({ ...locked, tidal_lock_target_type: null }).twilightZone);
  assert.ok(!profileFor({ twilight_zone: false, tidal_lock: '1:1', tidal_lock_target_type: 'Star' }).twilightZone);
  assert.ok(!profileFor({ twilight_zone: true, tidal_lock: null, tidal_lock_target_type: 'Star' }).twilightZone);
});

test('tidally locked worlds have no ice caps', () => {
  const locked = { twilight_zone: true, tidal_lock: '1:1', tidal_lock_target_type: 'Star' };
  assert.ok(profileFor({}).hasIceCaps);
  assert.ok(!profileFor(locked).hasIceCaps);
});

test('temperature decides frozen worlds', () => {
  assert.ok(profileFor({ temperature: 200 }).isFrozenSolid);
  assert.ok(!profileFor({ temperature: 288 }).isFrozenSolid);
});

test('hex digit codes such as A are read as numbers', () => {
  assert.strictEqual(PlanetProfile.digit('A'), 10);
  assert.strictEqual(PlanetProfile.digit(7), 7);
});
