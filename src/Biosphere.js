'use strict';

const Colour = require('./Colour');

/**
 * The native life on a world, read from its biomass rating. Life decides how
 * green the land is and whether crops can grow. A world whose JSON carries no
 * rating has an unknown biosphere and is drawn as the rulebook would draw it.
 */
class Biosphere {
  /** Atmospheres in which Terran life is unlikely: 0, 1, A, B, C and F+. */
  static HOSTILE_ATMOSPHERES = new Set([0, 1, 10, 11, 12]);
  static FIRST_HOSTILE_UNLISTED = 15;
  static CROPS_FROM = 3;
  static SCRUB_GREEN = Colour.fromHex('#a8b060');
  static MAXIMUM_SCRUB = 0.3;
  static LUSH = 10;

  static BARREN = Colour.fromHex('#8c8678');
  static TERRAN_RAMP = [
    { rating: 0, colour: Biosphere.BARREN },
    { rating: 4, colour: Colour.fromHex('#7f8a47') },
    { rating: Biosphere.LUSH, colour: Colour.fromHex('#4f7a35') },
  ];
  static ALIEN_RAMP = [
    { rating: 0, colour: Biosphere.BARREN },
    { rating: 4, colour: Colour.fromHex('#8a7a96') },
    { rating: Biosphere.LUSH, colour: Colour.fromHex('#5e4f96') },
  ];

  /** @param {number|null} rating the biomass rating, or null when the planet does not say */
  constructor(rating, atmosphere) {
    this.rating = rating;
    this.atmosphere = atmosphere;
  }

  static from(rating, atmosphere) {
    const known = rating !== null && rating !== undefined && rating !== '' && Number.isFinite(Number(rating));
    return new Biosphere(known ? Number(rating) : null, atmosphere);
  }

  get isKnown() {
    return this.rating !== null;
  }

  get hasLife() {
    return this.isKnown && this.rating > 0;
  }

  /** Life that exists, but could not be Terran. */
  get isAlien() {
    const hostile = Biosphere.HOSTILE_ATMOSPHERES.has(this.atmosphere) || this.atmosphere >= Biosphere.FIRST_HOSTILE_UNLISTED;
    return this.hasLife && hostile;
  }

  /** Whether farmers could grow crops here. Worlds with an unknown biosphere are given the benefit of the doubt. */
  get supportsCrops() {
    if (!this.isKnown) return true;
    return this.rating >= Biosphere.CROPS_FROM && !this.isAlien;
  }

  /** The colour of open ground: bare where nothing lives, greener where more does. */
  landColour(unknownColour) {
    if (!this.isKnown) return unknownColour;
    return Biosphere.along(this.isAlien ? Biosphere.ALIEN_RAMP : Biosphere.TERRAN_RAMP, this.rating);
  }

  /** Desert, with a little scrub in it where something lives. */
  desertColour(desert) {
    if (!this.hasLife) return desert;
    const share = (Math.min(this.rating, Biosphere.LUSH) / Biosphere.LUSH) * Biosphere.MAXIMUM_SCRUB;
    return desert.blend(this.isAlien ? Biosphere.ALIEN_RAMP[1].colour : Biosphere.SCRUB_GREEN, share);
  }

  static along(ramp, rating) {
    if (rating <= ramp[0].rating) return ramp[0].colour;
    for (let i = 1; i < ramp.length; i++) {
      const from = ramp[i - 1];
      const to = ramp[i];
      if (rating <= to.rating) return from.colour.blend(to.colour, (rating - from.rating) / (to.rating - from.rating));
    }
    return ramp[ramp.length - 1].colour;
  }
}

module.exports = Biosphere;
