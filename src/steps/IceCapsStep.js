'use strict';

const GenerationStep = require('./GenerationStep');
const Terrain = require('../Terrain');

/**
 * Ice caps cover Hydrographics/2 rows at each pole (plus 1D more on ice-capped
 * worlds, scaled up on worlds smaller than the grid), unless the world is too hot or is tidally locked.
 */
class IceCapsStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.hasIceCaps;
  }

  apply() {
    let rows = Math.floor(this.profile.hydrographics / 2);
    if (this.profile.isIceCapped) rows += this.rng.d6();
    rows = Math.min(this.profile.polarRows(rows), this.profile.gridSize);

    const lastRow = 3 * this.profile.gridSize;
    const capRows = [];
    for (let i = 0; i < rows; i++) capRows.push(i, lastRow - i);
    for (const hex of this.grid.hexesInRows(capRows)) {
      hex.terrain = Terrain.ICE_CAP;
      hex.features = [];
    }
  }
}

module.exports = IceCapsStep;
