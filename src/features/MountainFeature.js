'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class MountainFeature extends Feature {
  get legendLabel() {
    return 'Mountain';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(21).draw(x, y, Feature.INK);
  }
}

module.exports = MountainFeature;
