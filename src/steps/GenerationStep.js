'use strict';

/**
 * One step of the rulebook's world-map procedure. Subclasses say whether they
 * apply to a world and then change that world's hexes.
 */
class GenerationStep {
  constructor(world) {
    this.world = world;
  }

  get rng() {
    return this.world.rng;
  }

  get profile() {
    return this.world.profile;
  }

  get grid() {
    return this.world.grid;
  }

  static appliesTo() {
    return true;
  }

  apply() {
    throw new Error(`${this.constructor.name} must define apply`);
  }

  /** Places a feature on up to `count` free dry hexes of one triangle. */
  scatter(triangle, count, featureFactory, accept) {
    for (let i = 0; i < count; i++) {
      const hex = this.world.pickFreeHex(triangle, accept);
      if (hex) hex.addFeature(featureFactory());
    }
  }

  /** The rulebook's "1D per triangle", halved so features stay sparse enough to read. */
  sparseRoll() {
    return Math.ceil(this.rng.d6() / 2);
  }
}

module.exports = GenerationStep;
