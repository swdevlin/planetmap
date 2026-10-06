'use strict';

const GenerationStep = require('./GenerationStep');
const IslandFeature = require('../features/IslandFeature');
const MountainFeature = require('../features/MountainFeature');

/**
 * Hydrographics x 10% of the surface becomes ocean, as one large body, a few
 * smaller ones, and a scattering of one-hex seas (one per Hydrographics point).
 * Mountains standing in the ocean become islands.
 */
class OceansStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.hydrographics > 0;
  }

  apply() {
    const hexes = this.grid.hexes.filter((hex) => !hex.isPole);
    const hydrographics = Math.min(10, this.profile.hydrographics);
    const target = Math.round((hexes.length * hydrographics) / 10);
    const seas = Math.min(hydrographics, target);

    let remaining = target - seas;
    while (remaining > 0) {
      const start = this.randomDryHex(hexes);
      if (!start) break;
      const size = remaining <= 3 ? remaining : Math.ceil((remaining * this.rng.between(40, 65)) / 100);
      const body = this.world.growCluster(start, size, (hex) => !hex.isWater);
      body.forEach((hex) => this.flood(hex));
      remaining -= body.length;
    }
    for (let i = 0; i < seas; i++) {
      const hex = this.randomDryHex(hexes);
      if (hex) this.flood(hex);
    }
  }

  randomDryHex(hexes) {
    const dry = hexes.filter((hex) => !hex.isWater);
    return dry.length ? this.rng.pick(dry) : null;
  }

  flood(hex) {
    if (hex.hasFeatureOf(MountainFeature)) {
      hex.removeFeatureOf(MountainFeature);
      hex.addFeature(new IslandFeature());
    }
    hex.terrain = this.world.oceanTerrain;
  }
}

module.exports = OceansStep;
