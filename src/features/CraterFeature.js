'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class CraterFeature extends Feature {
  get legendLabel() {
    return 'Crater';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(74).draw(x, y, Feature.INK);
  }
}

module.exports = CraterFeature;
