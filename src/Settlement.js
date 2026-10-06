'use strict';

/** A named settlement of a given type, to be placed somewhere on the map. */
class Settlement {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

module.exports = Settlement;
