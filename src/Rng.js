'use strict';

const crypto = require('node:crypto');

/**
 * A seedable random number generator (mulberry32). The same seed always
 * produces the same sequence, which is what makes a map reproducible.
 */
class Rng {
  constructor(seed) {
    this.seed = String(seed);
    this.state = Rng.hash(this.seed);
  }

  static randomSeed() {
    return String(crypto.randomInt(1, 2 ** 31));
  }

  static hash(seed) {
    if (/^-?\d+$/.test(seed)) return Number(seed) >>> 0;
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  next() {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in 0..count-1. */
  int(count) {
    return Math.floor(this.next() * count);
  }

  /** Integer in low..high inclusive. */
  between(low, high) {
    return low + this.int(high - low + 1);
  }

  d6() {
    return this.between(1, 6);
  }

  /** Sum of the given number of six-sided dice. */
  roll(dice) {
    let total = 0;
    for (let i = 0; i < dice; i++) total += this.d6();
    return total;
  }

  chance(probability) {
    return this.next() < probability;
  }

  pick(items) {
    return items[this.int(items.length)];
  }

  shuffled(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  sample(items, count) {
    return this.shuffled(items).slice(0, count);
  }
}

module.exports = Rng;
