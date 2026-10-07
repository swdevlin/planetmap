'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class StarportFeature extends Feature {
  get legendLabel() {
    return 'Starport';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(56).draw(x, y, 'red');
  }
}

module.exports = StarportFeature;
