'use strict';

const test = require('node:test');
const assert = require('node:assert');
const BookSymbol = require('../src/features/BookSymbol');

test('all 54 symbols from the book are available', () => {
  const numbers = BookSymbol.all().map((symbol) => symbol.number);
  assert.strictEqual(numbers.length, 54);
  for (const row of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    for (const column of [1, 2, 3, 4, 5, 6]) assert.ok(numbers.includes(row * 10 + column), `${row}${column}`);
  }
});

test('symbols can be found by number or by name', () => {
  assert.strictEqual(BookSymbol.forNumber(21).name, 'Mountain');
  assert.strictEqual(BookSymbol.named('starport').number, 56);
  assert.strictEqual(BookSymbol.named('Baked Lands').number, 41);
  assert.throws(() => BookSymbol.forNumber(99), /No book symbol/);
});

test('every symbol but Clear is a traced outline that fits inside a hex', () => {
  for (const symbol of BookSymbol.all()) {
    if (symbol.number === 11) {
      assert.ok(symbol.isBlank);
      continue;
    }
    assert.ok(/^M [-\d.]+ [-\d.]+/.test(symbol.path), symbol.name);
    assert.ok(!symbol.path.includes('NaN'), symbol.name);
    assert.ok(symbol.width > 0 && symbol.width <= 28 && symbol.height > 0 && symbol.height <= 28, symbol.name);
  }
});

test('a symbol is drawn centred on the given point in the given colour', () => {
  const svg = BookSymbol.forNumber(21).draw(100, 50, 'red');
  assert.ok(svg.includes('translate(100 50)') && svg.includes('fill:red'));
  assert.strictEqual(BookSymbol.forNumber(11).draw(0, 0, 'red'), '');
});
