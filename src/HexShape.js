'use strict';

/**
 * The pixel geometry of a pointy-topped hex. The vertex offsets are slightly
 * asymmetric because they are whole pixels, matching the reference maps.
 */
class HexShape {
  static WIDTH = 32;
  static ROW_HEIGHT = 28;
  static BORDER_COLOUR = '#444';

  static vertices(x, y) {
    return [
      [x, y - 17],
      [x + 16, y - 10],
      [x + 16, y + 11],
      [x, y + 18],
      [x - 16, y + 11],
      [x - 16, y - 10],
    ];
  }

  static points(x, y) {
    return HexShape.vertices(x, y).map((point) => point.join(',')).join(' ');
  }

  /** One vertical half of the hex: the east (right) or west (left) side. */
  static halfPoints(x, y, side) {
    const dx = side === 'east' ? 16 : -16;
    const ring = [[x, y - 17], [x + dx, y - 10], [x + dx, y + 11], [x, y + 18]];
    return ring.map((point) => point.join(',')).join(' ');
  }
}

module.exports = HexShape;
