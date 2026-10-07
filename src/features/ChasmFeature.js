'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class ChasmFeature extends Feature {
  get legendLabel() {
    return 'Chasm';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(23).draw(x, y, Feature.INK);
  }
}

module.exports = ChasmFeature;
