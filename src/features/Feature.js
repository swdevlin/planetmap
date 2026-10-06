'use strict';

/**
 * Something drawn on top of a hex's terrain. Subclasses supply a legend label
 * and the SVG for their symbol, positioned relative to the hex centre.
 */
class Feature {
  /** The dark ink shared by terrain symbols. Only starports, resources and settlements are coloured. */
  static INK = 'rgb(40,28,18)';

  get key() {
    return this.constructor.name;
  }

  get legendLabel() {
    throw new Error(`${this.constructor.name} must define legendLabel`);
  }

  draw() {
    throw new Error(`${this.constructor.name} must define draw`);
  }
}

module.exports = Feature;
