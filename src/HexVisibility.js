'use strict';

const HexShape = require('./HexShape');

/**
 * How much of each hex can actually be seen on the finished map. The map window cuts hexes
 * at its edges and the white gap triangles hide the outer half of hexes along the triangle
 * edges, so a hex at a pole or a corner may be almost entirely hidden.
 */
class HexVisibility {
  static SAMPLES_PER_SIDE = 9;

  static MINIMUM_FRACTION = 0.25;

  constructor(grid) {
    this.grid = grid;
    this.cache = new Map();
  }

  /** The fraction (0 to 1) of the cell's hex that shows on the map. */
  fraction(cell) {
    if (!this.cache.has(cell)) this.cache.set(cell, this.measure(cell));
    return this.cache.get(cell);
  }

  /** Whether enough of the hex shows for what is on it to count as appearing on the map. */
  isVisible(cell) {
    return this.fraction(cell) >= HexVisibility.MINIMUM_FRACTION;
  }

  measure({ x, y }) {
    const vertices = HexShape.vertices(x, y);
    let inside = 0;
    let shown = 0;
    for (let i = 0; i < HexVisibility.SAMPLES_PER_SIDE; i++) {
      for (let j = 0; j < HexVisibility.SAMPLES_PER_SIDE; j++) {
        const px = x - 16 + ((i + 0.5) * 32) / HexVisibility.SAMPLES_PER_SIDE;
        const py = y - 17 + ((j + 0.5) * 35) / HexVisibility.SAMPLES_PER_SIDE;
        if (!HexVisibility.contains(vertices, px, py)) continue;
        inside++;
        if (this.isShown(px, py)) shown++;
      }
    }
    return inside === 0 ? 0 : shown / inside;
  }

  isShown(px, py) {
    const grid = this.grid;
    if (px < grid.left || px > grid.right || py < grid.top || py > grid.bottom) return false;
    return !grid.gaps.some((triangle) => HexVisibility.contains(triangle, px, py));
  }

  /** Point-in-convex-polygon test, either winding. */
  static contains(polygon, px, py) {
    let sign = 0;
    for (let i = 0; i < polygon.length; i++) {
      const [ax, ay] = polygon[i];
      const [bx, by] = polygon[(i + 1) % polygon.length];
      const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      if (cross === 0) continue;
      if (sign === 0) sign = Math.sign(cross);
      else if (Math.sign(cross) !== sign) return false;
    }
    return true;
  }
}

module.exports = HexVisibility;
