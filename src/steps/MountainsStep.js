'use strict';

const GenerationStep = require('./GenerationStep');
const MountainFeature = require('../features/MountainFeature');
const Terrain = require('../Terrain');

/** Places mountains in every triangle. */
class MountainsStep extends GenerationStep {
  apply() {
    for (const triangle of this.grid.triangles) {
      const candidates = triangle.hexes.filter((hex) => !hex.isPole);
      for (const hex of this.rng.sample(candidates, this.sparseRoll())) {
        hex.terrain = Terrain.MOUNTAINS;
        hex.addFeature(new MountainFeature());
      }
    }
  }
}

module.exports = MountainsStep;
