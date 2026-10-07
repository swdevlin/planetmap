'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class CroplandFeature extends Feature {
  get legendLabel() {
    return 'Cropland';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(24).draw(x, y, Feature.INK);
  }
}

module.exports = CroplandFeature;
