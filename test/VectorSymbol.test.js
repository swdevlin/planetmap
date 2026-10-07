'use strict';

const test = require('node:test');
const assert = require('node:assert');
const MapService = require('../src/MapService');
const SvgDefs = require('../src/SvgDefs');
const VectorSymbol = require('../src/features/VectorSymbol');
const BookSymbol = require('../src/features/BookSymbol');
const MountainFeature = require('../src/features/MountainFeature');
const ResourceFeature = require('../src/features/ResourceFeature');
const StarportFeature = require('../src/features/StarportFeature');
const planet = require('../testdata/size6.json');

test('each vector symbol redraws the book symbol with the same number', () => {
  assert.ok(VectorSymbol.all().length > 0);
  for (const symbol of VectorSymbol.all()) assert.strictEqual(symbol.name, BookSymbol.forNumber(symbol.number).name);
  assert.throws(() => VectorSymbol.forNumber(99), /No vector symbol/);
});

test('every vector symbol fits inside a hex', () => {
  for (const symbol of VectorSymbol.all()) {
    const numbers = symbol.path.match(/-?[\d.]+/g).map(Number);
    assert.ok(numbers.every((value) => Math.abs(value) <= 14), symbol.name);
  }
});

test('a symbol is stroked, centred on the given point in the given colour, with the glow', () => {
  const svg = VectorSymbol.forNumber(21).draw(100, 50, 'red');
  assert.ok(svg.includes('translate(100 50)') && svg.includes('stroke:red') && svg.includes('fill:none'));
  assert.ok(svg.includes('filter="url(#phosphor)"') && SvgDefs.markup().includes('id="phosphor"'));
});

test('map features draw the vector symbols', () => {
  assert.ok(new MountainFeature().draw(0, 0).includes(VectorSymbol.forNumber(21).path));
  assert.ok(new StarportFeature().draw(0, 0).includes(VectorSymbol.forNumber(56).path));
  assert.ok(new ResourceFeature().draw(0, 0).includes(VectorSymbol.forNumber(85).path));
});

test('a rendered map uses vector symbols and defines their glow', () => {
  const { svg } = new MapService().render(planet, 'demo');
  assert.ok(svg.includes('id="phosphor"'));
  assert.ok(svg.includes(VectorSymbol.forNumber(21).path));
  assert.ok(!svg.includes(BookSymbol.forNumber(21).path));
});
