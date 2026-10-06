'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class WastelandFeature extends Feature {
  get legendLabel() {
    return 'Wasteland';
  }

  draw(x, y) {
    return BookSymbol.forNumber(75).draw(x, y, Feature.INK);
  }
}

module.exports = WastelandFeature;
