'use strict';

const GenerationStep = require('./GenerationStep');
const RuinsFeature = require('../features/RuinsFeature');

/** Dieback worlds, and worlds that had an extinct sophont, have ruins in every triangle. */
class RuinsStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.hasRuins;
  }

  apply() {
    for (const triangle of this.world.landTriangles()) {
      this.scatter(triangle, this.sparseRoll(), () => new RuinsFeature());
    }
  }
}

module.exports = RuinsStep;
