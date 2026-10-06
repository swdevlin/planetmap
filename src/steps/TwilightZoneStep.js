'use strict';

const GenerationStep = require('./GenerationStep');
const HexShape = require('../HexShape');
const IslandFeature = require('../features/IslandFeature');
const Terrain = require('../Terrain');

/**
 * A tidally locked world has one hot, baked hemisphere, one frozen hemisphere,
 * and a one-hex-wide twilight zone between them. The zone runs straight down
 * from a pole; a second one lies half the world's circumference away. Hexes
 * the zone's edge passes through are painted on one half only. On the baked
 * hemisphere ocean becomes Desert, unless the world is hot enough for its
 * liquid to stay liquid (molten metal, say), in which case the ocean stays. The hexes in or
 * beside the zones are recorded for placing settlements.
 * Only worlds locked to a star have one; the profile decides that.
 */
class TwilightZoneStep extends GenerationStep {
  static HALF = HexShape.WIDTH / 2;

  static appliesTo(world) {
    return world.profile.twilightZone;
  }

  apply() {
    const grid = this.grid;
    const width = grid.width;
    const zoneX = grid.left + HexShape.WIDTH * grid.size * this.rng.int(5);
    const bakedFirst = this.rng.chance(0.5);

    const hemisphereA = { lo: TwilightZoneStep.HALF, hi: width / 2 - TwilightZoneStep.HALF };
    const hemisphereB = { lo: width / 2 + TwilightZoneStep.HALF, hi: width - TwilightZoneStep.HALF };
    const baked = bakedFirst ? hemisphereA : hemisphereB;
    const frozen = bakedFirst ? hemisphereB : hemisphereA;
    const frozenCentre = (frozen.lo + frozen.hi) / 2;
    const iceCapRadius = ((frozen.hi - frozen.lo) / 2) * 0.6;

    for (const hex of grid.hexes) {
      if (hex.isPole) continue;
      const u = (((hex.cells[0].x - zoneX) % width) + width) % width;
      if (Math.min(u, width - u, Math.abs(u - width / 2)) <= TwilightZoneStep.HALF) this.world.twilightHexes.push(hex);
      this.paint(hex, u, baked, (terrain) => (terrain.isWater && this.profile.climate.isBaking ? terrain : terrain.baked()));
      this.paint(hex, u, frozen, (terrain) => terrain.frozen());
      if (this.coversFully(u, frozen) && Math.abs(u - frozenCentre) <= iceCapRadius) {
        hex.terrain = Terrain.ICE_CAP;
        hex.removeFeatureOf(IslandFeature);
      }
    }
  }

  coversFully(u, arc) {
    return u - TwilightZoneStep.HALF >= arc.lo && u + TwilightZoneStep.HALF <= arc.hi;
  }

  paint(hex, u, arc, convert) {
    const converted = convert(hex.terrain);
    if (converted === hex.terrain) return;
    if (this.coversFully(u, arc)) {
      hex.removeFeatureOf(IslandFeature);
      hex.terrain = converted;
    } else if (u === arc.lo) {
      hex.paintHalf('east', converted);
    } else if (u === arc.hi) {
      hex.paintHalf('west', converted);
    }
  }
}

module.exports = TwilightZoneStep;
