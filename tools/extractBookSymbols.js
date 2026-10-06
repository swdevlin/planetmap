'use strict';

/**
 * Builds src/features/bookSymbols.json from the rulebook's "Terrain Symbols By Hand" chart.
 *
 *   node tools/extractBookSymbols.js [rulebook.pdf] [page]
 *
 * The chart is a grid of 54 bitmaps. For each one this strips the frame and caption, traces
 * the remaining ink into a vector path, and scales and centres it on (0, 0) for use in a hex.
 * Needs Ghostscript (GS environment variable, or the default Windows install) and the
 * dev dependencies (npm install).
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Potrace } = require('potrace');
const { PNG } = require('pngjs');
const BookPage = require('./BookPage');
const SymbolCleaner = require('./SymbolCleaner');

const NAMES = {
  11: 'Clear', 12: 'Marsh', 13: 'Rough', 14: 'Woods', 15: 'Swamp', 16: 'Rough Wood',
  21: 'Mountain', 22: 'Desert', 23: 'Chasm', 24: 'Cropland', 25: 'Rural', 26: 'Ruins',
  31: 'Ocean', 32: 'Islands', 33: 'Shore', 34: 'River', 35: 'Lake', 36: 'Icecap',
  41: 'Baked Lands', 42: 'Twilight', 43: 'Frozen Lands', 44: 'Ice Field', 45: 'Precipice', 46: 'Exotic',
  51: 'City', 52: 'Dome', 53: 'Arcology', 54: 'Suburbs', 55: 'Town', 56: 'Starport',
  61: 'Highway', 62: 'Road', 63: 'Trail', 64: 'Air Corridor', 65: 'Grid', 66: 'High Speed',
  71: 'Ocean Depth', 72: 'Abyss', 73: 'Caverns', 74: 'Crater', 75: 'Wasteland', 76: 'Penal',
  81: 'Volcano', 82: 'Estate', 83: 'Reserve', 84: 'Mine', 85: 'Resource', 86: 'Oil',
  91: 'Airpad', 92: 'Vlite Airstrip', 93: 'Lite Airstrip', 94: 'Airport', 95: 'Heavy Airport', 96: 'Vhvy Airport',
};

const SYMBOL_SCALE = 0.2; // hex pixels per bitmap pixel: gives strokes about 2.5px wide
const MAXIMUM_EXTENT = 28; // no symbol may be wider or taller than this, to stay inside a hex
const CHART = { left: 55, right: 549, columns: 6, top: 667, rowHeight: 64 };

function terrainNumber(placement) {
  const column = Math.round((placement.x - CHART.left) / ((CHART.right - CHART.left) / CHART.columns));
  const row = Math.round((CHART.top - (placement.y + placement.height)) / CHART.rowHeight);
  return (row + 1) * 10 + column + 1;
}

function inkBounds({ width, height, ink }) {
  let minX = width; let minY = height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!ink[y * width + x]) continue;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX: maxX + 1, maxY: maxY + 1 };
}

function toPng({ width, height, ink }) {
  const png = new PNG({ width, height });
  for (let i = 0; i < ink.length; i++) {
    const value = ink[i] ? 0 : 255;
    png.data[i * 4] = png.data[i * 4 + 1] = png.data[i * 4 + 2] = value;
    png.data[i * 4 + 3] = 255;
  }
  return PNG.sync.write(png);
}

function trace(symbol) {
  return new Promise((resolve, reject) => {
    const tracer = new Potrace({ turdSize: 2, optTolerance: 0.4, alphaMax: 1 });
    tracer.loadImage(toPng(symbol), (error) => {
      if (error) return reject(error);
      resolve(tracer.getSVG().match(/ d="([^"]*)"/)[1]);
    });
  });
}

/** Re-emits an absolute M/L/C path with every point moved to (x - cx) * scale, (y - cy) * scale. */
function transformPath(d, cx, cy, scale) {
  const tokens = d.replace(/,/g, ' ').trim().split(/\s+/);
  const out = [];
  let command = null;
  let numbers = [];
  const flush = () => {
    for (let i = 0; i < numbers.length; i += 2) {
      out.push(((numbers[i] - cx) * scale).toFixed(2).replace(/\.?0+$/, ''), ((numbers[i + 1] - cy) * scale).toFixed(2).replace(/\.?0+$/, ''));
    }
    numbers = [];
  };
  for (const token of tokens) {
    if (/^[MLCZ]$/i.test(token)) {
      flush();
      command = token;
      out.push(token);
    } else {
      numbers.push(Number(token));
    }
  }
  flush();
  return out.join(' ');
}

async function main() {
  const [rulebook = 'T5CRB3.pdf', page = '47'] = process.argv.slice(2);
  const ghostscript = process.env.GS || 'C:/Program Files/gs/gs10.08.0/bin/gswin64c.exe';
  const scratch = path.join(os.tmpdir(), `planetmap-page-${page}.pdf`);
  const chart = new BookPage(rulebook, Number(page), scratch, ghostscript);
  const objects = chart.objectNumbers();

  const symbols = {};
  for (const placement of chart.placements()) {
    const code = terrainNumber(placement);
    const cleaned = SymbolCleaner.clean(chart.image(objects[placement.name]));
    symbols[code] = { cleaned, bounds: inkBounds(cleaned) };
  }

  const result = {};
  for (const code of Object.keys(NAMES)) {
    const { cleaned, bounds } = symbols[code];
    if (!bounds) {
      result[code] = { name: NAMES[code], path: '', width: 0, height: 0 };
      continue;
    }
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    const fit = Math.min(SYMBOL_SCALE, MAXIMUM_EXTENT / w, MAXIMUM_EXTENT / h);
    const d = await trace(cleaned);
    result[code] = {
      name: NAMES[code],
      path: transformPath(d, (bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2, fit),
      width: Number((w * fit).toFixed(1)),
      height: Number((h * fit).toFixed(1)),
    };
  }
  const target = path.join(__dirname, '..', 'src', 'features', 'bookSymbols.json');
  fs.writeFileSync(target, `${JSON.stringify(result, null, 1)}\n`);
  console.log(`wrote ${Object.keys(result).length} symbols to ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
