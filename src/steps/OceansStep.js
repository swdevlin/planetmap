'use strict';

const GenerationStep = require('./GenerationStep');
const IslandFeature = require('../features/IslandFeature');
const MountainFeature = require('../features/MountainFeature');

/**
 * Hydrographics x 10% of the surface becomes ocean. The Surface Distribution
 * code says how the lesser surface (liquid up to Hydrographics 5, land above)
 * is split between major bodies and minor ones. Bodies are kept a hex apart so
 * they stay distinct. Mountains standing in the ocean become islands.
 */
class OceansStep extends GenerationStep {
  /** Percentage range of the lesser surface held in major bodies, by distribution code. */
  static MAJOR_SHARE = [
    [0, 0], [5, 10], [10, 20], [20, 30], [30, 40], [40, 60],
    [60, 70], [70, 80], [80, 90], [90, 95], [95, 100],
  ];

  /** Share of the surface a body needs to count as major. */
  static MAJOR_FRACTION = 0.03;

  /** Above this Hydrographics code the land, not the liquid, is the lesser surface. */
  static WATER_MAJORITY = 5;

  static appliesTo(world) {
    return world.profile.hydrographics > 0;
  }

  /** Smallest size of a major body on a surface of `hexCount` hexes. */
  static majorThreshold(hexCount) {
    return Math.max(3, Math.ceil(hexCount * OceansStep.MAJOR_FRACTION));
  }

  apply() {
    const hexes = this.grid.hexes.filter((hex) => !hex.isPole);
    const hydrographics = Math.min(10, this.profile.hydrographics);
    const waterTarget = Math.round((hexes.length * hydrographics) / 10);
    const landIsLesser = hydrographics > OceansStep.WATER_MAJORITY;
    const lesser = landIsLesser ? hexes.length - waterTarget : waterTarget;

    const bodies = this.placeBodies(hexes, this.bodySizes(lesser, hexes.length), lesser);
    const flooded = landIsLesser ? hexes.filter((hex) => !bodies.has(hex)) : [...bodies];
    flooded.forEach((hex) => this.flood(hex));
  }

  /** Sizes of the bodies making up `total` hexes of the lesser surface, majors first. */
  bodySizes(total, hexCount) {
    const threshold = OceansStep.majorThreshold(hexCount);
    const [low, high] = OceansStep.MAJOR_SHARE[this.profile.distribution];
    let major = Math.round((total * this.rng.between(low, high)) / 100);
    const count = Math.min(this.majorBodyCount(major, threshold), Math.floor(major / threshold));
    if (count === 0) major = 0;

    const sizes = this.split(major, count, threshold);
    let minor = total - major;
    while (minor > 0) {
      const size = Math.min(minor, threshold - 1, this.rng.between(1, 4));
      sizes.push(size);
      minor -= size;
    }
    return sizes;
  }

  majorBodyCount(major, threshold) {
    const code = this.profile.distribution;
    if (code >= 9) return 1;
    if (code >= 6) return this.rng.between(1, 2);
    if (code >= 3) return this.rng.between(2, 3);
    return Math.max(1, Math.min(4, Math.floor(major / threshold)));
  }

  /** Splits `total` into `count` random parts of at least `minimum`, largest first. */
  split(total, count, minimum) {
    if (count === 0) return [];
    const weights = Array.from({ length: count }, () => this.rng.between(1, 6));
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const spare = total - count * minimum;
    const sizes = weights.map((weight) => minimum + Math.floor((spare * weight) / weightSum));
    sizes[0] += total - sizes.reduce((sum, size) => sum + size, 0);
    return sizes.sort((a, b) => b - a);
  }

  /**
   * Grows each body in turn, a hex clear of the bodies before it. A body that
   * runs out of room passes its shortfall to the next. If the separated
   * bodies cannot reach `total`, the rest is placed without the gap.
   */
  placeBodies(hexes, sizes, total) {
    const claimed = new Set();
    const blocked = new Set();
    let shortfall = 0;
    for (const size of sizes) {
      const body = this.growBody(hexes, size + shortfall, (hex) => !blocked.has(hex));
      shortfall = size + shortfall - body.length;
      for (const hex of body) {
        claimed.add(hex);
        blocked.add(hex);
        this.grid.neighboursOf(hex).forEach((neighbour) => blocked.add(neighbour));
      }
    }
    while (claimed.size < total) {
      const body = this.growBody(hexes, total - claimed.size, (hex) => !claimed.has(hex));
      if (body.length === 0) break;
      body.forEach((hex) => claimed.add(hex));
    }
    return claimed;
  }

  /** Grows a connected body of up to `size` hexes from a random hex, keeping to hexes that `accept`. */
  growBody(hexes, size, accept) {
    const starts = hexes.filter(accept);
    if (size <= 0 || starts.length === 0) return [];
    const body = [this.rng.pick(starts)];
    const members = new Set(body);
    const frontier = [];
    const inFrontier = new Set();
    const extendFrom = (hex) => {
      for (const neighbour of this.grid.neighboursOf(hex)) {
        if (!members.has(neighbour) && !inFrontier.has(neighbour) && !neighbour.isPole && accept(neighbour)) {
          frontier.push(neighbour);
          inFrontier.add(neighbour);
        }
      }
    };
    extendFrom(body[0]);
    while (body.length < size && frontier.length > 0) {
      const index = this.rng.int(frontier.length);
      const hex = frontier[index];
      frontier[index] = frontier[frontier.length - 1];
      frontier.pop();
      inFrontier.delete(hex);
      body.push(hex);
      members.add(hex);
      extendFrom(hex);
    }
    return body;
  }

  flood(hex) {
    if (hex.hasFeatureOf(MountainFeature)) {
      hex.removeFeatureOf(MountainFeature);
      hex.addFeature(new IslandFeature());
    }
    hex.terrain = this.world.oceanTerrain;
  }
}

module.exports = OceansStep;