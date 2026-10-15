'use strict';

const GenerationStep = require('./GenerationStep');
const Terrain = require('../Terrain');

/**
 * Ice caps cover Hydrographics/2 rows at each pole (plus 1D more on ice-capped worlds, scaled up
 * on worlds smaller than the grid), unless the world is too hot or is tidally locked. When the
 * planet JSON gives an edge latitude, the cold reaches that far: past the solid cap only the
 * oceans freeze, and land becomes Frozen Land, so a world that is mostly land still shows it.
 * Caps of a liquid that freezes at temperatures that bake land, such as magma, are solid crust
 * and drawn as Baked Lands; land beyond such a cap is left alone.
 */
class IceCapsStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.hasIceCaps;
  }

  apply() {
    const terrain = this.profile.iceCapsAreCrust ? Terrain.BAKED : Terrain.ICE_CAP;
    const solidRows = this.rowsFromRulebook();
    const coldRows = this.profile.hasIceCapData ? this.rowsFromLatitude() : solidRows;
    const core = Math.min(solidRows, coldRows);

    for (const hex of this.grid.hexesInRows(this.capRows(0, core))) {
      hex.terrain = terrain;
      hex.features = [];
    }
    for (const hex of this.grid.hexesInRows(this.capRows(core, coldRows))) {
      if (hex.terrain.isWater) {
        hex.terrain = terrain;
        hex.features = [];
      } else if (!this.profile.iceCapsAreCrust) {
        hex.terrain = hex.terrain.frozen();
      }
    }
  }

  /** The rows `from` up to (not including) `to` rows from each pole. */
  capRows(from, to) {
    const lastRow = 3 * this.profile.gridSize;
    const rows = [];
    for (let i = from; i < to; i++) rows.push(i, lastRow - i);
    return rows;
  }

  rowsFromRulebook() {
    let rows = Math.floor(this.profile.hydrographics / 2);
    if (this.profile.isIceCapped) rows += this.rng.d6();
    return Math.min(this.profile.polarRows(rows), this.profile.gridSize);
  }

  /**
   * Rows from each pole whose centres lie at or beyond the edge latitude. Pole to pole is
   * 3 x grid size rows, so each row is 60 / grid size degrees of latitude.
   */
  rowsFromLatitude() {
    const degreesPerRow = 60 / this.profile.gridSize;
    const fromPole = 90 - Math.max(0, this.profile.iceCapEdgeLatitude);
    return Math.floor(fromPole / degreesPerRow) + 1;
  }
}

module.exports = IceCapsStep;
