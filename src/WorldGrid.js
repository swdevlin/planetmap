'use strict';

const Hex = require('./Hex');
const HexCell = require('./HexCell');
const HexShape = require('./HexShape');
const Triangle = require('./Triangle');

/**
 * The hexes of a world, laid out as a flattened icosahedron: a north cap of
 * five triangles, a band of ten, and a south cap of five.
 *
 * The map is one world-circumference wide. Hexes cut by the east and west
 * edges of the window, and the poles, are drawn in more than one place but
 * are each a single Hex.
 *
 * Coordinates: x is in pixels, rows run 0 (north pole) to 3 x size (south pole).
 */
class WorldGrid {
  static HALF = HexShape.WIDTH / 2;

  static TOP = 189;
  static NEIGHBOUR_STEPS = [
    [HexShape.WIDTH, 0],
    [-HexShape.WIDTH, 0],
    [WorldGrid.HALF, 1],
    [-WorldGrid.HALF, 1],
    [WorldGrid.HALF, -1],
    [-WorldGrid.HALF, -1],
  ];

  constructor(size) {
    this.size = size;
    this.left = 10 + WorldGrid.HALF * size;
    this.width = 5 * HexShape.WIDTH * size;
    this.right = this.left + this.width;
    this.rowCount = 3 * size + 1;
    this.cells = [];
    this.hexes = [];
    this.cellIndex = new Map();
    this.northPole = this.createHex(0);
    this.southPole = this.createHex(3 * size);
    this.northPole.isPole = this.southPole.isPole = true;
    this.hexes = [this.northPole, this.southPole];
    this.buildTriangles();
    this.buildCells();
    this.assignTriangles();
  }

  rowY(row) {
    return WorldGrid.TOP + HexShape.ROW_HEIGHT * row;
  }

  get top() {
    return this.rowY(0);
  }

  get bottom() {
    return this.rowY(3 * this.size);
  }

  createHex(row) {
    return new Hex(row);
  }

  /** The twenty canonical triangles, plus the wrapped duplicates needed to place edge hexes. */
  buildTriangles() {
    const size = this.size;
    const apexX = (k) => this.left + HexShape.WIDTH * size * k;
    const slope = WorldGrid.HALF;
    const within = (x, centre, distance) => Math.abs(x - centre) <= distance;

    const reach = slope * size;
    const y = (row) => this.rowY(row);

    this.extendedTriangles = [];
    const add = (kind, index, contains, vertices) =>
      this.extendedTriangles.push(new Triangle(Triangle.idFor(kind, index), kind, contains, vertices));

    for (let k = 0; k <= 5; k++) {
      const apex = apexX(k);
      add('north', k, (x, r) => r >= 0 && r <= size && within(x, apex, slope * r), [
        [apex, y(0)], [apex + reach, y(size)], [apex - reach, y(size)],
      ]);
    }
    for (let k = 0; k <= 5; k++) {
      const apex = apexX(k);
      add('band-down', k, (x, r) => r >= size && r <= 2 * size && within(x, apex, slope * (2 * size - r)), [
        [apex - reach, y(size)], [apex + reach, y(size)], [apex, y(2 * size)],
      ]);
    }
    for (let k = 0; k <= 4; k++) {
      const apex = apexX(k) + reach;
      add('band-up', k, (x, r) => r >= size && r <= 2 * size && within(x, apex, slope * (r - size)), [
        [apex, y(size)], [apex + reach, y(2 * size)], [apex - reach, y(2 * size)],
      ]);
    }
    for (let k = 0; k <= 4; k++) {
      const apex = apexX(k) + reach;
      add('south', k, (x, r) => r >= 2 * size && r <= 3 * size && within(x, apex, slope * (3 * size - r)), [
        [apex - reach, y(2 * size)], [apex + reach, y(2 * size)], [apex, y(3 * size)],
      ]);
    }

    this.triangles = [];
    for (let id = 0; id < 20; id++) {
      this.triangles.push(this.extendedTriangles.find((triangle) => triangle.id === id));
    }

    // The empty triangles between the caps. Edge hexes are centred on a triangle's edge, so
    // these are drawn over the hexes to cut off the half that sticks out.
    const step = HexShape.WIDTH * size;
    this.gaps = [];
    for (let k = -1; k <= 5; k++) {
      this.gaps.push([[apexX(k), y(0)], [apexX(k) + reach, y(size)], [apexX(k + 1), y(0)]]);
    }
    for (let k = -1; k <= 4; k++) {
      const apex = apexX(k) + reach;
      this.gaps.push([[apex, y(3 * size)], [apex + reach, y(2 * size)], [apex + step, y(3 * size)]]);
    }
  }

  containingTriangle(x, row) {
    return this.extendedTriangles.find((triangle) => triangle.contains(x, row));
  }

  buildCells() {
    for (let row = 0; row < this.rowCount; row++) {
      const offset = row % 2 === 0 ? 0 : WorldGrid.HALF;
      for (let x = this.left + offset; x <= this.right; x += HexShape.WIDTH) {
        if (!this.containingTriangle(x, row)) continue;
        this.placeCell(row, x);
      }
    }
  }

  placeCell(row, x) {
    const hex = this.hexFor(row, x);
    const cell = new HexCell(hex, x, this.rowY(row), row);
    hex.cells.push(cell);
    this.cells.push(cell);
    this.cellIndex.set(`${row},${x}`, cell);
  }

  /** The Hex for a position, creating it on first sight. The east edge is the west edge again. */
  hexFor(row, x) {
    if (row === 0) return this.northPole;
    if (row === 3 * this.size) return this.southPole;
    const canonicalX = x === this.right ? this.left : x;
    const existing = this.cellIndex.get(`${row},${canonicalX}`);
    if (existing) return existing.hex;
    const hex = this.createHex(row);
    this.hexes.push(hex);
    return hex;
  }

  assignTriangles() {
    for (const cell of this.cells) {
      if (cell.hex.triangle !== null) continue;
      const triangle = this.containingTriangle(cell.x, cell.row);
      cell.hex.triangle = triangle.id;
    }
    for (const hex of this.hexes) this.triangles[hex.triangle].hexes.push(hex);
  }

  cellsInRow(row) {
    return this.cells.filter((cell) => cell.row === row);
  }

  hexesInRows(rows) {
    const wanted = new Set(rows);
    return this.hexes.filter((hex) => wanted.has(hex.row));
  }

  /** Hexes sharing an edge with this one, as far as the flattened map connects them. */
  neighboursOf(hex) {
    const neighbours = new Set();
    for (const cell of hex.cells) {
      for (const [dx, dRow] of WorldGrid.NEIGHBOUR_STEPS) {
        let x = cell.x + dx;
        if (x < this.left) x += this.width;
        if (x > this.right) x -= this.width;
        const next = this.cellIndex.get(`${cell.row + dRow},${x}`);
        if (next && next.hex !== hex) neighbours.add(next.hex);
      }
    }
    return [...neighbours];
  }
}

module.exports = WorldGrid;
