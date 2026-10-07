'use strict';

/**
 * A map symbol drawn as vector-display line art: thin monoline strokes with a faint phosphor
 * glow, for a ship's console. Each one redraws the Traveller5 rulebook symbol with the same
 * terrain number (21 Mountain, 56 Starport, ...), centred on (0, 0) and sized to sit inside a hex.
 */
class VectorSymbol {
  static STROKE_WIDTH = 1.4;

  constructor(number, name, path) {
    this.number = number;
    this.name = name;
    this.path = path;
  }

  /** The symbol as SVG, stroked in `colour` and centred on (x, y). Needs the glow filter from SvgDefs. */
  draw(x, y, colour) {
    return (
      `<path d="${this.path}" transform="translate(${x} ${y})" filter="url(#phosphor)" ` +
      `style="fill:none;stroke:${colour};stroke-width:${VectorSymbol.STROKE_WIDTH};stroke-linecap:square;stroke-linejoin:miter"/>`
    );
  }

  static forNumber(number) {
    const symbol = VectorSymbol.byNumber().get(Number(number));
    if (!symbol) throw new Error(`No vector symbol numbered ${number}`);
    return symbol;
  }

  static all() {
    return [...VectorSymbol.byNumber().values()];
  }

  static byNumber() {
    if (!VectorSymbol.symbols) {
      VectorSymbol.symbols = new Map(
        Object.entries(PATHS).map(([number, [name, path]]) => [Number(number), new VectorSymbol(Number(number), name, path)])
      );
    }
    return VectorSymbol.symbols;
  }
}

// Paths fit a 28 x 18 box centred on the origin. A zero-length "h0.1" segment draws a dot.
const PATHS = {
  21: ['Mountain', 'M-12 7L-7 -6L-2 2L3 -7L10 7'],
  23: ['Chasm', 'M-13 -5H-9L-7 5M13 -5H9L7 5'],
  24: ['Cropland', 'M-8 -5V5M-4 -5V5M0 -5V5M4 -5V5M8 -5V5'],
  26: ['Ruins', 'M-13 6V-4H-9V2M-5 6V-6H1V6M5 3L8 0L11 3'],
  32: ['Islands', 'M-6 0A6 4 0 1 0 6 0A6 4 0 1 0 -6 0M-12 0h0.1M12 0h0.1'],
  45: ['Precipice', 'M-9 -6H-5L-11 6M-3 -6H1L-5 6M3 -6H7L1 6'],
  46: ['Exotic', 'M-13 4H13M-6 4A6 7 0 0 1 6 4'],
  56: ['Starport', 'M-5 0A5 5 0 1 0 5 0A5 5 0 1 0 -5 0M-9 0H9M0 -9V9'],
  74: ['Crater', 'M-12 0A12 5 0 1 0 12 0A12 5 0 1 0 -12 0M0 0h0.1'],
  75: ['Wasteland', 'M-12 6L-9 -5L-7 6M-3 6L0 -6L3 6M-1 6L0 1L1 6M7 6L10 -5L12 6'],
  85: ['Resource', 'M-3 -8H3M-4 7V-4L4 6'],
};

module.exports = VectorSymbol;
