'use strict';

const catalogue = require('./bookSymbols.json');

/**
 * One of the 54 terrain symbols from the Traveller5 rulebook's "Terrain Symbols By Hand"
 * chart, as a vector outline centred on (0, 0) and sized to sit inside a hex. They were
 * traced from the book's bitmaps by tools/extractBookSymbols.js.
 *
 * Symbols are identified by the book's terrain number (11 Clear ... 96 Vhvy Airport).
 */
class BookSymbol {
  constructor(number, name, path, width, height) {
    this.number = number;
    this.name = name;
    this.path = path;
    this.width = width;
    this.height = height;
  }

  /** Clear has no symbol: it is drawn as an empty hex. */
  get isBlank() {
    return this.path === '';
  }

  /** The symbol as SVG, filled with `colour` and centred on (x, y). */
  draw(x, y, colour) {
    if (this.isBlank) return '';
    return `<path d="${this.path}" transform="translate(${x} ${y})" style="fill:${colour};stroke:none;fill-rule:evenodd"/>`;
  }

  static forNumber(number) {
    const symbol = BookSymbol.byNumber().get(Number(number));
    if (!symbol) throw new Error(`No book symbol numbered ${number}`);
    return symbol;
  }

  static named(name) {
    const wanted = String(name).trim().toLowerCase();
    const symbol = BookSymbol.all().find((candidate) => candidate.name.toLowerCase() === wanted);
    if (!symbol) throw new Error(`No book symbol named ${name}`);
    return symbol;
  }

  static all() {
    return [...BookSymbol.byNumber().values()];
  }

  static byNumber() {
    if (!BookSymbol.symbols) {
      BookSymbol.symbols = new Map(
        Object.entries(catalogue).map(([number, entry]) => [
          Number(number),
          new BookSymbol(Number(number), entry.name, entry.path, entry.width, entry.height),
        ])
      );
    }
    return BookSymbol.symbols;
  }
}

module.exports = BookSymbol;
