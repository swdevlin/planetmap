'use strict';

const GenerationStep = require('./GenerationStep');
const WastelandFeature = require('../features/WastelandFeature');

/** Worlds above tech level 5 have a wasteland: 1D adjacent hexes in one triangle. */
class WastelandStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.techLevel > 5 && world.landTriangles().length > 0;
  }

  apply() {
    const start = this.world.pickFreeHex(this.rng.pick(this.world.landTriangles()));
    if (!start) return;
    const isFree = (hex) => hex.isDry && hex.features.length === 0 && !hex.isIceCap;
    for (const hex of this.world.growCluster(start, this.rng.d6(), isFree)) hex.addFeature(new WastelandFeature());
  }
}

module.exports = WastelandStep;
