'use strict';

const GenerationStep = require('./GenerationStep');
const PrecipiceFeature = require('../features/PrecipiceFeature');

/** Places World Size precipices, one hex each, in randomly chosen triangles. */
class PrecipicesStep extends GenerationStep {
  static appliesTo(world) {
    return world.landTriangles().length > 0;
  }

  apply() {
    for (let i = 0; i < this.profile.size; i++) {
      const hex = this.world.pickFreeHex(this.rng.pick(this.world.landTriangles()));
      if (hex) hex.addFeature(new PrecipiceFeature());
    }
  }
}

module.exports = PrecipicesStep;
