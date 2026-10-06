'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class MountainFeature extends Feature {
  get legendLabel() {
    return 'Mountain';
  }

  draw(x, y) {
    return BookSymbol.forNumber(21).draw(x, y, Feature.INK);
  }
}

module.exports = MountainFeature;
