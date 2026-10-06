'use strict';

/** A place on the flattened map where a hex is drawn. */
class HexCell {
  constructor(hex, x, y, row) {
    this.hex = hex;
    this.x = x;
    this.y = y;
    this.row = row;
  }
}

module.exports = HexCell;
