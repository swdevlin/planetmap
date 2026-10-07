'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class RuinsFeature extends Feature {
  get legendLabel() {
    return 'Ruins';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(26).draw(x, y, Feature.INK);
  }
}

module.exports = RuinsFeature;
