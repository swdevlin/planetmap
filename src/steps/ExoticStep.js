'use strict';

const GenerationStep = require('./GenerationStep');
const ExoticFeature = require('../features/ExoticFeature');

/** Every world has one exotic hex in one triangle. */
class ExoticStep extends GenerationStep {
  static appliesTo(world) {
    return world.landTriangles().length > 0;
  }

  apply() {
    this.scatter(this.rng.pick(this.world.landTriangles()), 1, () => new ExoticFeature());
  }
}

module.exports = ExoticStep;
