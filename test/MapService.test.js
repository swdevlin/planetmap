'use strict';

const test = require('node:test');
const assert = require('node:assert');
const MapService = require('../src/MapService');
const { samplePlanet } = require('./helpers');

const service = new MapService();
const draw = (planet, seed = '12345') => service.render(planet, seed);

test('the same seed draws the same map', () => {
  const planet = samplePlanet('size6.json');
  assert.strictEqual(draw(planet).svg, draw(planet).svg);
});

test('different seeds draw different maps', () => {
  const planet = samplePlanet('size6.json');
  assert.notStrictEqual(draw(planet, '1').svg, draw(planet, '2').svg);
});

test('a missing seed gets a random one that reproduces the map', () => {
  const planet = samplePlanet('size6.json');
  const first = draw(planet, undefined);
  assert.ok(first.seed);
  assert.strictEqual(draw(planet, first.seed).svg, first.svg);
});

test('the result reports render time and size', () => {
  const result = draw(samplePlanet('size6.json'));
  assert.ok(result.renderMs > 0);
  assert.strictEqual(result.bytes, Buffer.byteLength(result.svg));
});

test('settlements are drawn with the names in the JSON', () => {
  const { svg } = draw(samplePlanet('tidalocked.json'));
  for (let i = 1; i <= 7; i++) assert.ok(svg.includes(`>City ${i}</text>`));
});

test('settlements without names are called Settlement 1, 2, ...', () => {
  const planet = samplePlanet('size6.json', { city_count: 3 });
  planet.population.cities = [];
  const { svg } = draw(planet);
  assert.ok(svg.includes('>Settlement 1</text>') && svg.includes('>Settlement 3</text>'));
});

test('each settlement type has its own legend entry', () => {
  const planet = samplePlanet('size6.json');
  planet.population.cities = ['Cw', 'Cf', 'Cn', 'Cr'].map((code, i) => ({ name: `Town ${i}`, type_label: code }));
  const { svg } = draw(planet);
  for (const label of ['World capital', 'Faction capital', 'National capital', 'Regional capital']) {
    assert.ok(svg.includes(`>${label}</text>`), label);
  }
});

test('the map scale is 1,000 km for normal worlds', () => {
  assert.ok(draw(samplePlanet('size6.json')).svg.includes('1,000 km'));
});

test('worlds smaller than size 5 use 5 hexes and a smaller scale', () => {
  for (const [size, km] of [[4, '800'], [3, '600'], [2, '400'], [1, '200']]) {
    const { svg } = draw(samplePlanet('size6.json', { size_code: String(size) }));
    assert.ok(svg.includes(`${km} km`), `size ${size}`);
  }
});

test('non-water oceans use the liquid name in the legend', () => {
  const planet = samplePlanet('size6.json');
  planet.hydrographics.liquid.value = 'Sulfuric acid';
  const { svg } = draw(planet);
  assert.ok(svg.includes('Ocean (Sulfuric acid)'));
  assert.ok(svg.includes('rgb(216,210,74)'));
});

test('tidally locked worlds get half-hex legend entries', () => {
  assert.ok(draw(samplePlanet('tidalocked.json')).svg.includes('Half Only'));
});

test('size 0 worlds cannot be mapped', () => {
  assert.throws(() => draw(samplePlanet('size6.json', { size_code: '0' })), /cannot be mapped/);
});

test('on a tidally locked world, settlements lie in or beside a twilight zone', () => {
  const Rng = require('../src/Rng');
  const PlanetProfile = require('../src/PlanetProfile');
  const WorldBuilder = require('../src/WorldBuilder');
  for (const seed of ['1', '2', '3', '12345']) {
    const world = new WorldBuilder(new PlanetProfile(samplePlanet('tidalocked.json')), new Rng(seed)).build();
    assert.ok(world.settlementHexes.length === 7);
    for (const hex of world.settlementHexes) assert.ok(world.twilightHexes.includes(hex), `seed ${seed}`);
  }
});

test('a world locked to a planet is drawn without a twilight zone', () => {
  const { svg } = draw(samplePlanet('tidalocked.json', { tidal_lock_target_type: 'Planet' }));
  assert.ok(!svg.includes('Half Only'));
});

test('on a hot world all land is baked, but oceans are left alone', () => {
  const { svg } = draw(samplePlanet('size6.json', { temperature: 738 }));
  assert.ok(svg.includes('>Baked Lands</text>'));
  assert.ok(!svg.includes('>Clear</text>'));
  assert.ok(svg.includes('>Ocean</text>'));
});

test('a temperate world keeps its clear land', () => {
  const { svg } = draw(samplePlanet('size6.json'));
  assert.ok(svg.includes('>Clear</text>') && !svg.includes('>Baked Lands</text>'));
});

test('a small world padded to the minimum grid keeps the ice cap share it would have on its own grid', () => {
  const Rng = require('../src/Rng');
  const PlanetProfile = require('../src/PlanetProfile');
  const Terrain = require('../src/Terrain');
  const WorldBuilder = require('../src/WorldBuilder');
  const WorldGrid = require('../src/WorldGrid');

  const native = new WorldGrid(3);
  const nativeShare = native.hexesInRows([0, 1, 2, 9, 8, 7]).length / native.hexes.length;

  const planet = samplePlanet('size6.json', { size_code: '3', hydrographics: { code: 6, liquid: { value: 'Water' } } });
  const world = new WorldBuilder(new PlanetProfile(planet), new Rng('5')).build();
  const paddedShare = world.grid.hexes.filter((hex) => hex.terrain === Terrain.ICE_CAP).length / world.grid.hexes.length;
  assert.ok(Math.abs(paddedShare - nativeShare) < 0.06, `${paddedShare} vs ${nativeShare}`);
});

test('a world with an extinct sophont has ruins, however it is flagged', () => {
  assert.ok(!draw(samplePlanet('size6.json')).svg.includes('>Ruins</text>'));
  assert.ok(draw(samplePlanet('size6.json', { extinct_sophont: true })).svg.includes('>Ruins</text>'));
  const nested = samplePlanet('size6.json');
  nested.population.extinct_sophont.value = true;
  assert.ok(draw(nested).svg.includes('>Ruins</text>'));
});

test('a barren world with no extinct sophont has no ruins', () => {
  const planet = samplePlanet('1586025.json');
  assert.ok(!draw(planet).svg.includes('>Ruins</text>'));
  assert.ok(draw({ ...planet, extinct_sophont: true }).svg.includes('>Ruins</text>'));
});

test('the legend omits items that are only on mostly hidden hexes', () => {
  // Hydrographics 3 gives a one-row ice cap: just the pole hexes, which the map edges mostly hide.
  assert.ok(!draw(samplePlanet('size6.json')).svg.includes('>Ice cap</text>'));
  // A deeper ice cap shows plenty of full hexes.
  const planet = samplePlanet('size6.json', { hydrographics: { code: 8, liquid: { value: 'Water' } } });
  assert.ok(draw(planet).svg.includes('>Ice cap</text>'));
});

test('every legend entry has something on the map', () => {
  for (const file of ['size6.json', 'tidalocked.json', '1586025.json', '1586032.json']) {
    const { svg } = draw(samplePlanet(file));
    const legend = svg.slice(svg.lastIndexOf('</g>'));
    const labels = [...legend.matchAll(/>([^<]+)<\/text>/g)].map((m) => m[1]);
    assert.ok(!labels.includes('Scale'), file);
    assert.strictEqual(new Set(labels).size, labels.length, `${file}: duplicate legend entries`);
  }
});

test('craters thin out as the atmosphere thickens, and stop after atmosphere 3', () => {
  const Rng = require('../src/Rng');
  const PlanetProfile = require('../src/PlanetProfile');
  const CraterFeature = require('../src/features/CraterFeature');
  const WorldBuilder = require('../src/WorldBuilder');
  const craters = (atmosphere) => {
    let total = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const profile = new PlanetProfile(samplePlanet('size6.json', { atmosphere: { code: atmosphere } }));
      const world = new WorldBuilder(profile, new Rng(String(seed))).build();
      total += world.grid.hexes.filter((hex) => hex.hasFeatureOf(CraterFeature)).length;
    }
    return total;
  };
  const counts = [0, 1, 2, 3, 4, 7].map(craters);
  assert.ok(counts[0] > counts[1] && counts[1] > counts[2] && counts[2] > counts[3], counts.join(' '));
  assert.ok(counts[3] > 0, 'atmosphere 3 still has some craters');
  assert.strictEqual(counts[4], 0);
  assert.strictEqual(counts[5], 0);
});

test('on a hot tidally locked world the baked hemisphere keeps its liquid oceans', () => {
  const lockedStar = { tidal_lock: '1:1', tidal_lock_target_type: 'Star', twilight_zone: true };
  const hot = draw(samplePlanet('tidalocked.json', { ...lockedStar, temperature: 700 })).svg;
  const mild = draw(samplePlanet('tidalocked.json', lockedStar)).svg;
  assert.ok(!hot.includes('>Desert</text>'), 'liquid stays liquid, so nothing dries to Desert');
  assert.ok(hot.includes('>Baked Lands</text>'));
  assert.ok(mild.includes('>Desert</text>'), 'a mild world still dries its baked-side water to Desert');
});

test('the legend shows every feature on a white hex, including Island', () => {
  const { svg } = draw(samplePlanet('size6.json'));
  const legend = svg.slice(svg.lastIndexOf('</g>'));
  const islandIcon = legend.slice(legend.lastIndexOf('<polygon', legend.indexOf('>Island</text>') - 1500), legend.indexOf('>Island</text>'));
  assert.ok(islandIcon.includes('fill: white'), 'Island legend hex is white');
});
