'use strict';

const GenerationStep = require('./GenerationStep');
const ResourceFeature = require('../features/ResourceFeature');

/** Marks randomly chosen hexes as resources. Any hex will do, land or water, whatever else is on it. */
class ResourcesStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.resourceHexes > 0;
  }

  apply() {
    for (const hex of this.rng.sample(this.grid.hexes, this.profile.resourceHexes)) hex.addFeature(new ResourceFeature());
  }
}

module.exports = ResourcesStep;
