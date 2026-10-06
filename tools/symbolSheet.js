'use strict';

/** Writes output/book-symbols.svg: every book symbol, drawn at map size and enlarged, for review. */
const fs = require('node:fs');
const path = require('node:path');
const BookSymbol = require('../src/features/BookSymbol');
const HexShape = require('../src/HexShape');

const COLUMNS = 6;
const CELL_WIDTH = 190;
const CELL_HEIGHT = 120;
const symbols = BookSymbol.all();
const rows = Math.ceil(symbols.length / COLUMNS);

let body = '';
symbols.forEach((symbol, index) => {
  const left = (index % COLUMNS) * CELL_WIDTH;
  const top = Math.floor(index / COLUMNS) * CELL_HEIGHT;
  const hexX = left + 40;
  const hexY = top + 45;
  body += `<polygon points="${HexShape.points(hexX, hexY)}" style="stroke:black;stroke-width:1;fill:white"/>`;
  body += symbol.draw(hexX, hexY, 'black');
  body += `<g transform="translate(${left + 120} ${top + 45}) scale(2)">${symbol.draw(0, 0, 'black')}</g>`;
  body += `<text x="${left + 10}" y="${top + 100}" style="font-size:12px;font-family:Arial, sans-serif">${symbol.number} ${symbol.name}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLUMNS * CELL_WIDTH}" height="${rows * CELL_HEIGHT}" viewBox="0 0 ${COLUMNS * CELL_WIDTH} ${rows * CELL_HEIGHT}"><rect width="100%" height="100%" fill="white"/>${body}</svg>`;
fs.writeFileSync(path.join(__dirname, '..', 'output', 'book-symbols.svg'), svg);
console.log(`wrote output/book-symbols.svg with ${symbols.length} symbols`);
