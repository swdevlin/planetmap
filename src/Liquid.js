'use strict';

const Colour = require('./Colour');

/** The liquid filling a world's oceans, and the colour used to draw it. */
class Liquid {
  constructor(name, colour, aliases) {
    this.name = name;
    this.colour = colour;
    this.aliases = aliases || [name];
  }

  get isWater() {
    return this === Liquid.WATER;
  }

  /** Legend text for ocean hexes of this liquid. */
  get oceanLabel() {
    return this.isWater ? 'Ocean' : `Ocean (${this.name})`;
  }

  matches(text) {
    return this.aliases.some((alias) => alias.toLowerCase() === text.toLowerCase());
  }

  /**
   * Looks a liquid up by name. A "Molten" prefix is ignored when finding the colour but kept
   * in the name. An unknown liquid is drawn in neutral grey so the gap is obvious.
   */
  static named(name) {
    const text = String(name || 'Water').trim();
    const bare = text.replace(/^molten\s+/i, '');
    const found = Liquid.catalogue().find((liquid) => liquid.matches(bare));
    if (!found) return new Liquid(text, Liquid.UNKNOWN_COLOUR);
    return bare === text ? found : new Liquid(text, found.colour);
  }

  static catalogue() {
    return Liquid.entries;
  }
}

const liquid = (name, hex, aliases) => new Liquid(name, Colour.fromHex(hex), aliases);

Liquid.WATER = liquid('Water', '#5a82cc');
Liquid.UNKNOWN_COLOUR = Colour.fromHex('#9a9a9a');
Liquid.entries = [
  Liquid.WATER,
  liquid('Sulfur dioxide', '#d9b38c'),
  liquid('Sulfuric acid', '#d8d24a'),
  liquid('Hydrochloric acid', '#e59aa8'),
  liquid('Hydrofluoric acid', '#6fd0bd'),
  liquid('Hydrogen cyanide', '#f7f2c4'),
  liquid('Carbonic acid', '#9fb8c8'),
  liquid('Formic acid', '#d4a5d9'),
  liquid('Formamide', '#8f8fd0'),
  liquid('Nitric acid', '#e07a3c'),
  liquid('Sulfur', '#e6b422'),
  liquid('Sodium', '#d8dce0'),
  liquid('Potassium', '#c9cbe0'),
  liquid('Fluorine', '#f0f080'),
  liquid('Chlorine', '#8ec63f'),
  liquid('Ammonia', '#b7d7a8'),
  liquid('Hydrocarbon', '#5f8f9a', ['Ethane', 'Alkane', 'Propane', 'Butane', 'Hydrocarbon', 'Petrol', 'Oil']),
  liquid('Methane', '#b87333'),
  liquid('Oxygen', '#8fc6ec'),
  liquid('Nitrogen', '#dfe9f3'),
  liquid('Carbon dioxide', '#c8c8d0'),
];

module.exports = Liquid;
