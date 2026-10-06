'use strict';

const Feature = require('./Feature');
const Xml = require('../Xml');

/** A settlement symbol, whose shape depends on the settlement's type. */
class SettlementFeature extends Feature {
  constructor(settlement) {
    super();
    this.settlement = settlement;
  }

  get key() {
    return `SettlementFeature:${this.settlement.type.code}`;
  }

  get legendLabel() {
    return this.settlement.type.label;
  }

  draw(x, y) {
    return this.settlement.type.draw(x + 6, y + 8);
  }

  /** The settlement's name, drawn beneath its hex. */
  label(x, y) {
    const name = Xml.escape(this.settlement.name);
    return (
      `<text x="${x}" y="${y + 24}" text-anchor="middle" style="font-size:9px;font-family:Arial, sans-serif;` +
      `font-weight:bold;fill:black;stroke:white;stroke-width:2.5px;paint-order:stroke;stroke-linejoin:round;">${name}</text>`
    );
  }
}

module.exports = SettlementFeature;
