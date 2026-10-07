'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class WastelandFeature extends Feature {
  get legendLabel() {
    return 'Wasteland';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(75).draw(x, y, Feature.INK);
  }
}

module.exports = WastelandFeature;
