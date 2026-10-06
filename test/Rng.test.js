'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Rng = require('../src/Rng');

test('the same seed gives the same sequence', () => {
  const a = new Rng('12345');
  const b = new Rng('12345');
  assert.deepStrictEqual([a.next(), a.next(), a.int(100)], [b.next(), b.next(), b.int(100)]);
});

test('different seeds give different sequences', () => {
  assert.notStrictEqual(new Rng('1').next(), new Rng('2').next());
});

test('text seeds are accepted', () => {
  assert.strictEqual(new Rng('hello').next(), new Rng('hello').next());
});

test('between stays within its inclusive bounds', () => {
  const rng = new Rng('7');
  for (let i = 0; i < 500; i++) {
    const value = rng.between(3, 5);
    assert.ok(value >= 3 && value <= 5);
  }
});

test('shuffled keeps every item', () => {
  const items = [1, 2, 3, 4, 5, 6];
  assert.deepStrictEqual(new Rng('9').shuffled(items).sort(), items);
});
