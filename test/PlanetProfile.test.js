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

test('the resource rating sets how many hexes are marked as resources', () => {
  const expected = { 0: 0, 5: 0, 6: 1, 7: 2, 8: 2, 9: 3, 10: 3, 11: 4, 15: 4 };
  for (const [rating, hexes] of Object.entries(expected)) {
    assert.strictEqual(profileFor({ resource_rating: Number(rating) }).resourceHexes, hexes, `rating ${rating}`);
  }
});

test('the resource rating is read from the top level or from the biological data', () => {
  assert.strictEqual(profileFor({ resource_rating: 'B' }).resourceRating, 11);
  const nested = { resource_rating: undefined, population: { code: 4, biological_data: { resource_rating: { code: 9 } } } };
  assert.strictEqual(profileFor(nested).resourceRating, 9);
});

const TEMPERATURES = [
  { latitude: 0, temperature: 376.5 },
  { latitude: 15, temperature: 376.5 },
  { latitude: 30, temperature: 376.5 },
  { latitude: 45, temperature: 361.1 },
  { latitude: 60, temperature: 335.1 },
  { latitude: 75, temperature: 303.7 },
  { latitude: 90, temperature: 265.7 },
];
const ICE_CAPS = { liquid: 'Molten Potassium', melting_point_k: 336.7, edge_temperature_k: 326.7, edge_latitude: 64.3, coverage: 0.099, note: null };

test('without ice cap data the rulebook decides the ice caps', () => {
  assert.ok(!profileFor({}).hasIceCapData);
});

test('the ice cap edge latitude is read from the JSON', () => {
  const profile = profileFor({ latitude_temperatures: TEMPERATURES, ice_caps: ICE_CAPS });
  assert.ok(profile.hasIceCapData && profile.hasIceCaps);
  assert.strictEqual(profile.iceCapEdgeLatitude, 64.3);
});

test('without an edge latitude, the edge is where the temperatures fall to the edge temperature', () => {
  const profile = profileFor({ latitude_temperatures: TEMPERATURES, ice_caps: { ...ICE_CAPS, edge_latitude: null } });
  assert.ok(Math.abs(profile.iceCapEdgeLatitude - 64.01) < 0.01, `${profile.iceCapEdgeLatitude}`);
});

test('ice cap data with no edge means no ice caps, even where the rulebook would draw them', () => {
  const tooWarm = TEMPERATURES.map((point) => ({ ...point, temperature: 400 }));
  const profile = profileFor({ latitude_temperatures: tooWarm, ice_caps: { ...ICE_CAPS, edge_latitude: null } });
  assert.ok(profile.hasIceCapData && !profile.hasIceCaps);
});

test('worlds locked to their star ignore the ice cap data', () => {
  const locked = { tidal_lock: '1:1', tidal_lock_target_type: 'Star' };
  assert.ok(!profileFor({ ...locked, ice_caps: ICE_CAPS }).hasIceCapData);
});

test('only a 1:1 lock to a star counts as tidally locked', () => {
  for (const tidalLock of ['prograde', 'retrograde', '3:2', 'day-stretch', null]) {
    assert.ok(!profileFor({ tidal_lock: tidalLock, tidal_lock_target_type: 'Star' }).tidallyLockedToStar, tidalLock);
  }
  assert.ok(profileFor({ tidal_lock: '1:1', tidal_lock_target_type: 'Star' }).tidallyLockedToStar);
});

test('a world slowed by tidal drag uses its ice cap data', () => {
  const slowed = { tidal_lock: 'prograde', tidal_lock_target_type: 'Star', twilight_zone: false };
  const profile = profileFor({ ...slowed, latitude_temperatures: TEMPERATURES, ice_caps: ICE_CAPS });
  assert.ok(profile.hasIceCapData && profile.hasIceCaps);
  assert.strictEqual(profile.iceCapEdgeLatitude, 64.3);
});

test('caps of a liquid that freezes at baking temperatures are crust, not ice', () => {
  assert.ok(profileFor({ ice_caps: { ...ICE_CAPS, liquid: 'Magma', melting_point_k: 900 } }).iceCapsAreCrust);
  assert.ok(!profileFor({ ice_caps: ICE_CAPS }).iceCapsAreCrust);
  assert.ok(!profileFor({}).iceCapsAreCrust);
});
