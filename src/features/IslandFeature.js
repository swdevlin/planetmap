'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class IslandFeature extends Feature {
  get legendLabel() {
    return 'Island';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(32).draw(x, y, Feature.INK);
  }
}

module.exports = IslandFeature;
