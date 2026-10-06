'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Biosphere = require('../src/Biosphere');
const Colour = require('../src/Colour');
const MapService = require('../src/MapService');
const PlanetProfile = require('../src/PlanetProfile');
const World = require('../src/World');
const { samplePlanet } = require('./helpers');

const UNKNOWN = Colour.fromHex('#7f8a47');
const profileFor = (changes) => new PlanetProfile(samplePlanet('size6.json', changes));
const landColourOf = (changes) => World.landTerrainFor(profileFor(changes)).colour;

test('a world with no biomass rating has an unknown biosphere and the plain Clear colour', () => {
  const biosphere = Biosphere.from(undefined, 6);
  assert.ok(!biosphere.isKnown && !biosphere.hasLife);
  assert.strictEqual(biosphere.landColour(UNKNOWN), UNKNOWN);
  assert.ok(biosphere.supportsCrops);
});

test('the biomass rating is read from the top level or from the biological data', () => {
  assert.strictEqual(profileFor({ biomass_rating: 7 }).biosphere.rating, 7);
  const nested = { biomass_rating: undefined, population: { code: 4, biological_data: { biomass_rating: { value: 9 } } } };
  assert.strictEqual(profileFor(nested).biosphere.rating, 9);
});

test('land is bare where nothing lives, and greener as biomass rises', () => {
  const bare = Biosphere.from(-5, 6).landColour(UNKNOWN);
  const middling = Biosphere.from(4, 6).landColour(UNKNOWN);
  const lush = Biosphere.from(12, 6).landColour(UNKNOWN);
  assert.deepStrictEqual(bare, Biosphere.BARREN);
  assert.ok(middling.g > middling.r && middling.g > middling.b);
  assert.ok(lush.g < middling.g, 'lush land is a deeper green');
  assert.ok(lush.r < middling.r);
});

test('life in an atmosphere hostile to Terran life is alien, and not shaded green', () => {
  for (const atmosphere of [0, 1, 10, 11, 12, 15]) assert.ok(Biosphere.from(5, atmosphere).isAlien, `atmosphere ${atmosphere}`);
  for (const atmosphere of [2, 6, 9, 13]) assert.ok(!Biosphere.from(5, atmosphere).isAlien, `atmosphere ${atmosphere}`);
  assert.ok(!Biosphere.from(0, 10).isAlien, 'no life, so nothing alien');
  const alien = Biosphere.from(10, 10).landColour(UNKNOWN);
  assert.ok(alien.b > alien.g);
});

test('crops need a Terran biosphere of some substance', () => {
  assert.ok(Biosphere.from(3, 6).supportsCrops);
  assert.ok(!Biosphere.from(2, 6).supportsCrops);
  assert.ok(!Biosphere.from(10, 10).supportsCrops);
});

test('a farming world with no life has no cropland, nor one with a pop 0 garden', () => {
  const farming = { hydrographics: { code: 6 }, population: { code: 6, cities: [] } };
  assert.ok(profileFor({ ...farming, biomass_rating: 8 }).hasCropland);
  assert.ok(!profileFor({ ...farming, biomass_rating: 0 }).hasCropland);
  assert.ok(profileFor({ ...farming, biomass_rating: undefined }).hasCropland);
  assert.ok(!profileFor({ hydrographics: { code: 6 }, population: { code: 0, cities: [] }, biomass_rating: 10 }).hasCropland);
});

test('desert gains a little scrub where life exists, and stays plain where it does not', () => {
  const desert = Colour.fromHex('#ffffcc');
  assert.deepStrictEqual(Biosphere.from(0, 6).desertColour(desert), desert);
  const scrubby = Biosphere.from(10, 6).desertColour(desert);
  assert.ok(scrubby.b < desert.b && scrubby.r < desert.r);
});

test('a dry world draws desert, shaded by its life', () => {
  const terrain = World.landTerrainFor(profileFor({ hydrographics: { code: 0 }, biomass_rating: 6 }));
  assert.ok(terrain.key === 'desert' && terrain.label === 'Desert');
});

test('a lifeless and a lush world are drawn in different colours of Clear', () => {
  const lifeless = landColourOf({ biomass_rating: -3 });
  const lush = landColourOf({ biomass_rating: 11 });
  assert.notDeepStrictEqual(lifeless, lush);
});

test('both samples still render, with Clear in the legend', () => {
  for (const file of ['size6.json', 'tidalocked.json']) {
    const { svg } = new MapService().render(samplePlanet(file), 'seed');
    assert.ok(svg.includes('>Clear<'), file);
  }
});
