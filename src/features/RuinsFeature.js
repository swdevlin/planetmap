'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class RuinsFeature extends Feature {
  get legendLabel() {
    return 'Ruins';
  }

  draw(x, y) {
    return BookSymbol.forNumber(26).draw(x, y, Feature.INK);
  }
}

module.exports = RuinsFeature;
