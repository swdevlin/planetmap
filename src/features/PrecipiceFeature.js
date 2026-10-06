'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class PrecipiceFeature extends Feature {
  get legendLabel() {
    return 'Precipice';
  }

  draw(x, y) {
    return BookSymbol.forNumber(45).draw(x, y, Feature.INK);
  }
}

module.exports = PrecipiceFeature;
