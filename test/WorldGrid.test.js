'use strict';

const test = require('node:test');
const assert = require('node:assert');
const WorldGrid = require('../src/WorldGrid');

test('every hex belongs to one of the twenty triangles', () => {
  for (const size of [5, 6, 9]) {
    const grid = new WorldGrid(size);
    assert.strictEqual(grid.triangles.length, 20);
    assert.ok(grid.hexes.every((hex) => hex.triangle >= 0 && hex.triangle < 20));
    assert.strictEqual(grid.triangles.reduce((sum, t) => sum + t.hexes.length, 0), grid.hexes.length);
  }
});

test('the poles are single hexes drawn once per triangle apex', () => {
  const grid = new WorldGrid(6);
  assert.strictEqual(grid.cellsInRow(0).length, 6);
  assert.strictEqual(grid.cellsInRow(18).length, 5);
  assert.strictEqual(grid.northPole.cells.length, 6);
});

test('hexes on the east edge are the same hexes as on the west edge', () => {
  const grid = new WorldGrid(6);
  const middle = grid.cellsInRow(12);
  assert.strictEqual(middle[0].hex, middle[middle.length - 1].hex);
});

test('a band row has five hexes per triangle edge around the world', () => {
  const grid = new WorldGrid(5);
  const distinct = new Set(grid.cellsInRow(8).map((cell) => cell.hex));
  assert.strictEqual(distinct.size, 25);
});

test('neighbours wrap around the world', () => {
  const grid = new WorldGrid(6);
  const westmost = grid.cellsInRow(9)[0].hex;
  assert.ok(grid.neighboursOf(westmost).length >= 5);
});
