'use strict';

const GenerationStep = require('./GenerationStep');
const Terrain = require('../Terrain');

/**
 * On a world hot enough to bake its whole surface, all land is Baked Lands,
 * whether or not the world is tidally locked. Oceans (of molten metal, say)
 * stay as they are, and features such as mountains are kept.
 */
class HotWorldStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.climate.isBaking && !world.profile.twilightZone;
  }

  apply() {
    for (const hex of this.grid.hexes) {
      if (!hex.isWater && !hex.isIceCap) hex.terrain = Terrain.BAKED;
    }
  }
}

module.exports = HotWorldStep;
