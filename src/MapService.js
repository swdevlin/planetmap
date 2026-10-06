'use strict';

const MapRenderer = require('./MapRenderer');
const PlanetProfile = require('./PlanetProfile');
const Rng = require('./Rng');
const WorldBuilder = require('./WorldBuilder');

/** Turns a planet's JSON, and optionally a seed, into an SVG map. */
class MapService {
  /**
   * @param {object} planetJson the planet's characteristics
   * @param {string} [seed] seed for the random number generator; random if omitted
   * @returns {{svg: string, seed: string, renderMs: number, bytes: number}} the map, the seed that
   *   reproduces it, how long drawing took, and the size of the SVG in bytes
   */
  render(planetJson, seed) {
    const started = performance.now();
    const usedSeed = String(seed ?? '').trim() || Rng.randomSeed();
    const profile = new PlanetProfile(planetJson);
    const world = new WorldBuilder(profile, new Rng(usedSeed)).build();
    const svg = new MapRenderer(world).render();
    return { svg, seed: usedSeed, renderMs: performance.now() - started, bytes: Buffer.byteLength(svg) };
  }
}

module.exports = MapService;
