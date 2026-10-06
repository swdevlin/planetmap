'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class ChasmFeature extends Feature {
  get legendLabel() {
    return 'Chasm';
  }

  draw(x, y) {
    return BookSymbol.forNumber(23).draw(x, y, Feature.INK);
  }
}

module.exports = ChasmFeature;
