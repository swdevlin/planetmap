'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class ExoticFeature extends Feature {
  get legendLabel() {
    return 'Exotic Terrain';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(46).draw(x, y, Feature.INK);
  }
}

module.exports = ExoticFeature;
