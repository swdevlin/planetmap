'use strict';

const GenerationStep = require('./GenerationStep');
const StarportFeature = require('../features/StarportFeature');

/** Places the world's starport at its first settlement, or anywhere dry if it has none. */
class StarportStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.hasStarport && world.landTriangles().length > 0;
  }

  apply() {
    const hex =
      this.world.settlementHexes[0] || this.world.pickFreeHex(this.rng.pick(this.world.landTriangles()));
    if (hex) hex.addFeature(new StarportFeature());
  }
}

module.exports = StarportStep;
