'use strict';

const GenerationStep = require('./GenerationStep');
const CraterFeature = require('../features/CraterFeature');

/**
 * Airless worlds are pitted with craters in every triangle. A thin atmosphere wears craters
 * away, so the number falls off with atmosphere: full at 0, then less and less through 3.
 */
class CratersStep extends GenerationStep {
  /** Craters relative to a vacuum world, by atmosphere code 0 to 3. */
  static DENSITY = [1, 0.6, 0.35, 0.15];

  static appliesTo(world) {
    return world.profile.atmosphere < CratersStep.DENSITY.length;
  }

  apply() {
    const density = CratersStep.DENSITY[this.profile.atmosphere];
    for (const triangle of this.world.landTriangles()) {
      this.scatter(triangle, this.scaled(this.sparseRoll() * density), () => new CraterFeature());
    }
  }

  /** Rounds a fractional count up or down at random, so the average comes out right. */
  scaled(expected) {
    const whole = Math.floor(expected);
    return whole + (this.rng.chance(expected - whole) ? 1 : 0);
  }
}

module.exports = CratersStep;
