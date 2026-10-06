'use strict';

/**
 * Stands in for the rulebook's HZ (habitable zone) offsets, which the planet
 * JSON does not carry, by classifying the world's mean temperature in kelvin.
 * Thresholds live here so they can be tuned in one place.
 */
class Climate {
  static FROZEN_BELOW = 223;
  static COLD_BELOW = 273;
  static HOT_ABOVE = 323;
  static BAKED_FROM = 373;

  constructor(kelvin) {
    this.kelvin = kelvin;
  }

  get isFrozen() {
    return this.kelvin < Climate.FROZEN_BELOW;
  }

  /** The rulebook's HZ+1 band. */
  get isCold() {
    return this.kelvin >= Climate.FROZEN_BELOW && this.kelvin < Climate.COLD_BELOW;
  }

  get isHabitable() {
    return this.kelvin >= Climate.COLD_BELOW && this.kelvin <= Climate.HOT_ABOVE;
  }

  get isHot() {
    return this.kelvin > Climate.HOT_ABOVE;
  }

  /** Hot enough that all land is baked: above the boiling point of water at standard pressure. */
  get isBaking() {
    return this.kelvin >= Climate.BAKED_FROM;
  }

  /** The rulebook's "HZ or greater": habitable zone or colder. */
  get allowsIceCaps() {
    return !this.isHot;
  }
}

module.exports = Climate;
