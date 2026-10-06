'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class CraterFeature extends Feature {
  get legendLabel() {
    return 'Crater';
  }

  draw(x, y) {
    return BookSymbol.forNumber(74).draw(x, y, Feature.INK);
  }
}

module.exports = CraterFeature;
