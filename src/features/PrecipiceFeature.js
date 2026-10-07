'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class PrecipiceFeature extends Feature {
  get legendLabel() {
    return 'Precipice';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(45).draw(x, y, Feature.INK);
  }
}

module.exports = PrecipiceFeature;
