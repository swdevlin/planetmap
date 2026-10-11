'use strict';

const test = require('node:test');
const assert = require('node:assert');
const PlanetProfile = require('../src/PlanetProfile');
const Rng = require('../src/Rng');
const World = require('../src/World');
const OceansStep = require('../src/steps/OceansStep');
const { samplePlanet } = require('./helpers');

/** Floods a size 8 world and returns its bodies of the lesser surface. */
function lesserBodies(hydrographics, distribution, seed) {
  const json = samplePlanet('size6.json', { size_code: 8 });
  json.hydrographics = { code: hydrographics, distribution: { code: distribution } };
  const world = new World(new PlanetProfile(json), new Rng(seed));
  new OceansStep(world).apply();
  const surface = world.grid.hexes.filter((hex) => !hex.isPole);
  const waterIsLesser = hydrographics <= OceansStep.WATER_MAJORITY;
  const bodies = world.bodiesOf((hex) => hex.isWater === waterIsLesser);
  return { surface, bodies, threshold: OceansStep.majorThreshold(surface.length) };
}

const majorShare = ({ bodies, threshold }) => {
  const total = bodies.reduce((sum, body) => sum + body.length, 0);
  const major = bodies.filter((body) => body.length >= threshold).reduce((sum, body) => sum + body.length, 0);
  return (100 * major) / total;
};

test('the distribution code is read from the hydrographics, defaulting to mixed', () => {
  const json = samplePlanet('size6.json');
  json.hydrographics = { code: 4, distribution: { code: 'A' } };
  assert.strictEqual(new PlanetProfile(json).distribution, 10);
  json.hydrographics = { code: 4 };
  assert.strictEqual(new PlanetProfile(json).distribution, 5);
});

test('hydrographics sets how much of the surface is ocean', () => {
  for (const hydrographics of [3, 8]) {
    const { surface, bodies } = lesserBodies(hydrographics, 5, '7');
    const lesser = hydrographics <= 5 ? hydrographics : 10 - hydrographics;
    const expected = Math.round((surface.length * lesser) / 10);
    assert.strictEqual(bodies.reduce((sum, body) => sum + body.length, 0), expected);
  }
});

test('extremely dispersed surfaces have no major bodies', () => {
  for (const hydrographics of [3, 8]) {
    for (const seed of ['1', '2', '3']) {
      const { bodies, threshold } = lesserBodies(hydrographics, 0, seed);
      assert.ok(bodies.every((body) => body.length < threshold), `hydro ${hydrographics} seed ${seed}`);
    }
  }
});

test('concentrated surfaces are mostly one body', () => {
  for (const hydrographics of [3, 8]) {
    for (const [distribution, minimum] of [[9, 90], [10, 95]]) {
      const { bodies } = lesserBodies(hydrographics, distribution, '4');
      const total = bodies.reduce((sum, body) => sum + body.length, 0);
      assert.ok((100 * bodies[0].length) / total >= minimum - 2, `hydro ${hydrographics} code ${distribution}`);
    }
  }
});

test('the share in major bodies follows the distribution code', () => {
  for (const hydrographics of [3, 8]) {
    for (const distribution of [2, 5, 7]) {
      const [low, high] = OceansStep.MAJOR_SHARE[distribution];
      const result = lesserBodies(hydrographics, distribution, '11');
      const share = majorShare(result);
      const total = result.bodies.reduce((sum, body) => sum + body.length, 0);
      const tooSmallForMajors = (total * low) / 100 < result.threshold;
      const inRange = share >= low - 5 && share <= high + 5;
      assert.ok(inRange || (tooSmallForMajors && share === 0), `hydro ${hydrographics} code ${distribution}: ${share}`);
    }
  }
});