'use strict';

const VectorSymbol = require('./VectorSymbol');
const Feature = require('./Feature');

class ResourceFeature extends Feature {
  get legendLabel() {
    return 'Resource';
  }

  draw(x, y) {
    return VectorSymbol.forNumber(85).draw(x, y, 'rgb(102,0,102)');
  }
}

module.exports = ResourceFeature;
