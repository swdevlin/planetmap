'use strict';

const GenerationStep = require('./GenerationStep');
const ChasmFeature = require('../features/ChasmFeature');

/** Places World Size chasm sets (the real size, not the padded grid), each a connected run of up to 1D hexes. */
class ChasmsStep extends GenerationStep {
  static appliesTo(world) {
    return world.landTriangles().length > 0;
  }

  apply() {
    for (let i = 0; i < this.profile.size; i++) {
      const triangle = this.rng.pick(this.world.landTriangles());
      const start = this.world.pickFreeHex(triangle);
      if (!start) continue;
      const isFree = (hex) => hex.isDry && hex.features.length === 0 && !hex.isIceCap;
      for (const hex of this.world.growCluster(start, this.rng.d6(), isFree)) hex.addFeature(new ChasmFeature());
    }
  }
}

module.exports = ChasmsStep;
