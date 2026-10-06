'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class ExoticFeature extends Feature {
  get legendLabel() {
    return 'Exotic Terrain';
  }

  draw(x, y) {
    return BookSymbol.forNumber(46).draw(x, y, Feature.INK);
  }
}

module.exports = ExoticFeature;
