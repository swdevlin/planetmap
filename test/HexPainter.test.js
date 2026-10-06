'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Colour = require('../src/Colour');
const HexPainter = require('../src/HexPainter');
const Terrain = require('../src/Terrain');

test('saturated colours get the full jitter', () => {
  assert.strictEqual(HexPainter.spreadFor(Terrain.CLEAR.colour), 0.1);
  assert.strictEqual(HexPainter.spreadFor(Terrain.BAKED.colour), 0.1);
});

test('pale colours get a much smaller jitter', () => {
  assert.ok(HexPainter.spreadFor(Terrain.ICE_CAP.colour) <= 0.03);
  assert.ok(HexPainter.spreadFor(Colour.fromHex('#c9cbe0')) < 0.06);
  assert.ok(HexPainter.spreadFor(Terrain.DESERT.colour) < 0.07);
});

test('jitter never moves a channel further than the spread', () => {
  const Rng = require('../src/Rng');
  const rng = new Rng('3');
  const base = Colour.fromHex('#c9cbe0');
  for (let i = 0; i < 200; i++) {
    const shade = base.jittered(rng, 0.03);
    assert.ok(Math.abs(shade.r - base.r) <= base.r * 0.03 + 1);
  }
});

test('a grey stays grey when jittered', () => {
  const Rng = require('../src/Rng');
  const rng = new Rng('11');
  const rock = Terrain.MOUNTAINS.colour;
  for (let i = 0; i < 200; i++) {
    const shade = rock.jittered(rng, HexPainter.spreadFor(rock));
    assert.ok(Math.max(shade.r, shade.g, shade.b) - Math.min(shade.r, shade.g, shade.b) <= 16, shade.toCss());
  }
});

test('saturated colours still vary channel by channel', () => {
  const Rng = require('../src/Rng');
  const rng = new Rng('11');
  const seen = new Set();
  for (let i = 0; i < 50; i++) seen.add(Math.round((Terrain.CLEAR.colour.jittered(rng, 0.1).r / Terrain.CLEAR.colour.jittered(rng, 0.1).g) * 20));
  assert.ok(seen.size > 3);
});
