'use strict';

const GenerationStep = require('./GenerationStep');
const HexVisibility = require('../HexVisibility');
const ResourceFeature = require('../features/ResourceFeature');

/**
 * Marks randomly chosen hexes as resources. Any hex will do, land or water, whatever else is on it,
 * except the poles, which show only as slivers at the triangles' tips.
 */
class ResourcesStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.resourceHexes > 0;
  }

  apply() {
    const visibility = new HexVisibility(this.grid);
    const candidates = this.grid.hexes.filter((hex) => visibility.showsSymbolOn(hex));
    for (const hex of this.rng.sample(candidates, this.profile.resourceHexes)) hex.addFeature(new ResourceFeature());
  }
}

module.exports = ResourcesStep;
