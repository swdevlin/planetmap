'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Liquid = require('../src/Liquid');

test('water is the default liquid', () => {
  assert.strictEqual(Liquid.named(undefined), Liquid.WATER);
  assert.strictEqual(Liquid.named('water'), Liquid.WATER);
});

test('known liquids use their table colour, whatever the case', () => {
  assert.strictEqual(Liquid.named('sulfuric ACID').colour.toCss(), 'rgb(216,210,74)');
  assert.strictEqual(Liquid.named('Petrol').colour.toCss(), 'rgb(95,143,154)');
});

test('a molten prefix keeps the name but borrows the colour', () => {
  const molten = Liquid.named('Molten Sodium');
  assert.strictEqual(molten.name, 'Molten Sodium');
  assert.strictEqual(molten.colour.toCss(), Liquid.named('Sodium').colour.toCss());
  assert.strictEqual(molten.oceanLabel, 'Ocean (Molten Sodium)');
});

test('potassium has its own colour', () => {
  assert.strictEqual(Liquid.named('Molten Potassium').colour.toCss(), 'rgb(201,203,224)');
});

test('an unknown liquid is neutral grey, not water blue', () => {
  const unknown = Liquid.named('Molten Unobtainium');
  assert.strictEqual(unknown.colour.toCss(), 'rgb(154,154,154)');
  assert.ok(!unknown.isWater);
});
