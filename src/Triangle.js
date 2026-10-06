'use strict';

/**
 * One of the twenty triangles of the icosahedral world map: a "continent"
 * or an "ocean". Position tests use map coordinates of (x pixels, row), where
 * a triangle edge slopes by half a hex width (16px) per row.
 */
class Triangle {
  static GROUP_ORDER = ['north', 'band-down', 'band-up', 'south'];

  /**
   * @param {number} id canonical triangle number, 0-19
   * @param {string} kind north, band-down, band-up or south
   * @param {function(number, number): boolean} contains whether a point (x, row) lies in the triangle, edges included
   * @param {number[][]} vertices the three corners as [x, y] pixel positions, for drawing the outline
   */
  constructor(id, kind, contains, vertices) {
    this.id = id;
    this.kind = kind;
    this.contains = contains;
    this.vertices = vertices;
    this.hexes = [];
  }

  get landHexes() {
    return this.hexes.filter((hex) => hex.isDry && !hex.isPole && !hex.isIceCap);
  }

  /** The canonical triangle id for the triangle with this index in one of the four 5-triangle groups. */
  static idFor(kind, index) {
    return Triangle.GROUP_ORDER.indexOf(kind) * 5 + (index % 5);
  }
}

module.exports = Triangle;
