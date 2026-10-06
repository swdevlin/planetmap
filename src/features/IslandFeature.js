'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class IslandFeature extends Feature {
  get legendLabel() {
    return 'Island';
  }

  draw(x, y) {
    return BookSymbol.forNumber(32).draw(x, y, Feature.INK);
  }
}

module.exports = IslandFeature;
