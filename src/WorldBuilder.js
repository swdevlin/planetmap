'use strict';

const BaseTerrainStep = require('./steps/BaseTerrainStep');
const ChasmsStep = require('./steps/ChasmsStep');
const CratersStep = require('./steps/CratersStep');
const CroplandStep = require('./steps/CroplandStep');
const ExoticStep = require('./steps/ExoticStep');
const FrozenWorldStep = require('./steps/FrozenWorldStep');
const HotWorldStep = require('./steps/HotWorldStep');
const IceCapsStep = require('./steps/IceCapsStep');
const MountainsStep = require('./steps/MountainsStep');
const OceansStep = require('./steps/OceansStep');
const PrecipicesStep = require('./steps/PrecipicesStep');
const ResourcesStep = require('./steps/ResourcesStep');
const RuinsStep = require('./steps/RuinsStep');
const SettlementsStep = require('./steps/SettlementsStep');
const StarportStep = require('./steps/StarportStep');
const TwilightZoneStep = require('./steps/TwilightZoneStep');
const WastelandStep = require('./steps/WastelandStep');
const World = require('./World');

/** Builds a world by running the generation steps, in rulebook order, that apply to it. */
class WorldBuilder {
  static STEPS = [
    BaseTerrainStep,
    MountainsStep,
    OceansStep,
    IceCapsStep,
    FrozenWorldStep,
    HotWorldStep,
    TwilightZoneStep,
    ChasmsStep,
    PrecipicesStep,
    ResourcesStep,
    RuinsStep,
    CratersStep,
    CroplandStep,
    WastelandStep,
    ExoticStep,
    SettlementsStep,
    StarportStep,
  ];

  constructor(profile, rng) {
    this.profile = profile;
    this.rng = rng;
  }

  build() {
    const world = new World(this.profile, this.rng);
    for (const Step of WorldBuilder.STEPS) {
      if (Step.appliesTo(world)) new Step(world).apply();
    }
    return world;
  }
}

module.exports = WorldBuilder;
