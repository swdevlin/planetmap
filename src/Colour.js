'use strict';

/** An RGB colour that can be jittered per hex to give the map a natural look. */
class Colour {
  constructor(r, g, b) {
    this.r = Colour.clamp(r);
    this.g = Colour.clamp(g);
    this.b = Colour.clamp(b);
  }

  static clamp(channel) {
    return Math.max(0, Math.min(255, Math.round(channel)));
  }

  static fromHex(hex) {
    const digits = hex.replace('#', '');
    return new Colour(
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16)
    );
  }

  /** How close to white the colour is, 0 to 1: its weakest channel. Pale colours show jitter as a tint. */
  get paleness() {
    return Math.min(this.r, this.g, this.b) / 255;
  }

  /** 0 for a grey, 1 for a fully saturated colour. */
  get saturation() {
    const strongest = Math.max(this.r, this.g, this.b);
    return strongest === 0 ? 0 : (strongest - Math.min(this.r, this.g, this.b)) / strongest;
  }

  /**
   * A random variation of the colour, each channel within 1 +/- spread. Saturated colours vary
   * channel by channel; greys and pale colours mostly vary all channels together, since
   * independent changes would tint them pink, green or blue.
   */
  jittered(rng, spread) {
    const independence = Math.min(1, Math.max(0.15, this.saturation * 2));
    const shared = rng.next() * 2 - 1;
    const scale = () => 1 + spread * ((1 - independence) * shared + independence * (rng.next() * 2 - 1));
    return new Colour(this.r * scale(), this.g * scale(), this.b * scale());
  }

  /** This colour moved `share` (0 to 1) of the way toward another. */
  blend(other, share) {
    const mix = (from, to) => from + (to - from) * share;
    return new Colour(mix(this.r, other.r), mix(this.g, other.g), mix(this.b, other.b));
  }

  toCss() {
    return `rgb(${this.r},${this.g},${this.b})`;
  }
}

module.exports = Colour;
