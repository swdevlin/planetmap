'use strict';

const GenerationStep = require('./GenerationStep');
const CroplandFeature = require('../features/CroplandFeature');
const Terrain = require('../Terrain');

/** Agricultural worlds farm 2D hexes per continent, farming worlds 1D. */
class CroplandStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.hasCropland;
  }

  apply() {
    for (const triangle of this.world.landTriangles()) {
      let count = 0;
      if (this.profile.isAgricultural) count += this.rng.roll(2);
      if (this.profile.isFarming) count += this.rng.d6();
      this.scatter(triangle, count, () => new CroplandFeature(), (hex) => hex.terrain.isClear);
    }
  }
}

module.exports = CroplandStep;
