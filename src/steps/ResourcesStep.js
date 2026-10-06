'use strict';

const GenerationStep = require('./GenerationStep');
const ResourceFeature = require('../features/ResourceFeature');

/** Places one resource hex in each of Resource-factor randomly chosen triangles. */
class ResourcesStep extends GenerationStep {
  static appliesTo(world) {
    return world.profile.resourceFactor > 0;
  }

  apply() {
    const triangles = this.rng.sample(this.world.landTriangles(), this.profile.resourceFactor);
    for (const triangle of triangles) this.scatter(triangle, 1, () => new ResourceFeature());
  }
}

module.exports = ResourcesStep;
