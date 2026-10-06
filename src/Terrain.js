'use strict';

const Colour = require('./Colour');

/**
 * A kind of terrain a hex can have, with the base colour it is drawn in and
 * whether it takes the land or the water texture.
 */
class Terrain {
  constructor(key, label, colour, texture) {
    this.key = key;
    this.label = label;
    this.colour = colour;
    this.texture = texture;
  }

  get isWater() {
    return this.key === 'ocean';
  }

  get isClear() {
    return this.key === 'clear';
  }

  get isIce() {
    return this.key === 'icecap' || this.key === 'icefield' || this.key === 'frozen';
  }

  /** What this terrain becomes on the baked (sunward) hemisphere of a tidally locked world. */
  baked() {
    return this.isWater ? Terrain.DESERT : Terrain.BAKED;
  }

  /** What this terrain becomes on the frozen (night) hemisphere of a tidally locked world. */
  frozen() {
    return this.isWater ? Terrain.ICE_FIELD : Terrain.FROZEN;
  }

  /** Open ground on a world whose life colours it. */
  static clear(colour) {
    return new Terrain('clear', 'Clear', colour, 'land');
  }

  static desert(colour) {
    return new Terrain('desert', 'Desert', colour, 'land');
  }

  static ocean(liquid) {
    return new Terrain('ocean', liquid.oceanLabel, liquid.colour, 'water');
  }
}

Terrain.CLEAR = new Terrain('clear', 'Clear', Colour.fromHex('#7f8a47'), 'land');
Terrain.MOUNTAINS = new Terrain('mountains', 'Mountain terrain', Colour.fromHex('#bab6af'), 'land');
Terrain.DESERT = new Terrain('desert', 'Desert', Colour.fromHex('#ffffcc'), 'land');
Terrain.BAKED = new Terrain('baked', 'Baked Lands', Colour.fromHex('#ff7733'), 'land');
Terrain.FROZEN = new Terrain('frozen', 'Frozen Land', Colour.fromHex('#dbdfb9'), 'land');
Terrain.ICE_FIELD = new Terrain('icefield', 'Ice Field', Colour.fromHex('#e6ecff'), 'land');
Terrain.ICE_CAP = new Terrain('icecap', 'Ice cap', Colour.fromHex('#ffffff'), 'land');

module.exports = Terrain;
