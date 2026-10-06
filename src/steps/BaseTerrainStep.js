'use strict';

const GenerationStep = require('./GenerationStep');

/** Desert worlds are desert everywhere; every other world starts as Clear. Life shades either. */
class BaseTerrainStep extends GenerationStep {
  apply() {
    for (const hex of this.grid.hexes) hex.terrain = this.world.landTerrain;
  }
}

module.exports = BaseTerrainStep;
