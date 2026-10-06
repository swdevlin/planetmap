'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class StarportFeature extends Feature {
  get legendLabel() {
    return 'Starport';
  }

  draw(x, y) {
    return BookSymbol.forNumber(56).draw(x, y, 'red');
  }
}

module.exports = StarportFeature;
