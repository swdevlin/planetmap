'use strict';

const Terrain = require('./Terrain');
const WorldGrid = require('./WorldGrid');

/**
 * A world being mapped: its profile, its grid of hexes, and the random
 * number generator that decides everything the profile leaves open.
 */
class World {
  constructor(profile, rng) {
    this.profile = profile;
    this.rng = rng;
    this.grid = new WorldGrid(profile.gridSize);
    this.oceanTerrain = Terrain.ocean(profile.liquid);
    this.landTerrain = World.landTerrainFor(profile);
    this.settlementHexes = [];
    this.twilightHexes = [];
  }

  /** What dry ground is drawn as before anything else changes it: desert or clear, shaded by the life on it. */
  static landTerrainFor(profile) {
    const { biosphere } = profile;
    if (profile.isDesert) return Terrain.desert(biosphere.desertColour(Terrain.DESERT.colour));
    return Terrain.clear(biosphere.landColour(Terrain.CLEAR.colour));
  }

  get name() {
    return this.profile.name;
  }

  /** Triangles that still have dry hexes to put things on. */
  landTriangles() {
    return this.grid.triangles.filter((triangle) => triangle.landHexes.length > 0);
  }

  /** Dry hexes of a triangle that carry no features yet. */
  freeHexes(triangle) {
    return triangle.landHexes.filter((hex) => hex.features.length === 0);
  }

  pickFreeHex(triangle, accept = () => true) {
    const candidates = this.freeHexes(triangle).filter(accept);
    return candidates.length ? this.rng.pick(candidates) : null;
  }

  /**
   * Grows a connected group of up to `count` hexes outward from `start`,
   * staying within hexes that satisfy `accept`.
   */
  growCluster(start, count, accept) {
    const cluster = [start];
    while (cluster.length < count) {
      const frontier = new Set();
      for (const hex of cluster) {
        for (const neighbour of this.grid.neighboursOf(hex)) {
          if (!cluster.includes(neighbour) && !neighbour.isPole && accept(neighbour)) frontier.add(neighbour);
        }
      }
      if (frontier.size === 0) break;
      cluster.push(this.rng.pick([...frontier]));
    }
    return cluster;
  }
}

module.exports = World;
