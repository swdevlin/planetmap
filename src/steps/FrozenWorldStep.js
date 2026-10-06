'use strict';

const GenerationStep = require('./GenerationStep');
const IslandFeature = require('../features/IslandFeature');

/**
 * Frozen worlds turn all ocean to ice field and all land to frozen land.
 * Tundra worlds do the same within 1D rows of each pole.
 */
class FrozenWorldStep extends GenerationStep {
  static appliesTo(world) {
    return !world.profile.twilightZone && (world.profile.isFrozenSolid || world.profile.isTundra);
  }

  apply() {
    if (this.profile.isFrozenSolid) {
      this.freeze(this.grid.hexes);
      return;
    }
    const lastRow = 3 * this.profile.gridSize;
    const northRows = this.profile.polarRows(this.rng.d6());
    const southRows = this.profile.polarRows(this.rng.d6());
    this.freeze(this.grid.hexes.filter((hex) => hex.row <= northRows || hex.row >= lastRow - southRows));
  }

  freeze(hexes) {
    for (const hex of hexes) {
      if (hex.isIceCap) continue;
      hex.removeFeatureOf(IslandFeature);
      hex.terrain = hex.terrain.frozen();
    }
  }
}

module.exports = FrozenWorldStep;
