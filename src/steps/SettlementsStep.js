'use strict';

const GenerationStep = require('./GenerationStep');
const SettlementFeature = require('../features/SettlementFeature');

/**
 * Places the profile's settlements, one per continent in turn, so they spread
 * across the world instead of clustering. On a tidally locked world, only the
 * twilight zones are habitable, so settlements go there.
 */
class SettlementsStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.settlements.length > 0 && world.landTriangles().length > 0;
  }

  apply() {
    const continents = this.rng.shuffled(this.world.landTriangles());
    this.profile.settlements.forEach((settlement, index) => {
      const hex = this.twilightHex() || this.continentHex(continents[index % continents.length]);
      hex.addFeature(new SettlementFeature(settlement));
      this.world.settlementHexes.push(hex);
    });
  }

  continentHex(triangle) {
    return this.world.pickFreeHex(triangle) || this.rng.pick(triangle.landHexes);
  }

  /** A free dry hex in or beside a twilight zone, if the world has one with room left. */
  twilightHex() {
    const habitable = (hex) => hex.isDry && !hex.isPole && !hex.isIceCap && !hex.hasFeatureOf(SettlementFeature);
    const pool = this.world.twilightHexes.filter(habitable);
    const free = pool.filter((hex) => hex.features.length === 0);
    const choices = free.length ? free : pool;
    return choices.length ? this.rng.pick(choices) : null;
  }
}

module.exports = SettlementsStep;
