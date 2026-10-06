'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class CroplandFeature extends Feature {
  get legendLabel() {
    return 'Cropland';
  }

  draw(x, y) {
    return BookSymbol.forNumber(24).draw(x, y, Feature.INK);
  }
}

module.exports = CroplandFeature;
