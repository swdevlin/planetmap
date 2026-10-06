'use strict';

const BookSymbol = require('./BookSymbol');
const Feature = require('./Feature');

class ResourceFeature extends Feature {
  get legendLabel() {
    return 'Resource';
  }

  draw(x, y) {
    return BookSymbol.forNumber(85).draw(x, y, 'rgb(102,0,102)');
  }
}

module.exports = ResourceFeature;
