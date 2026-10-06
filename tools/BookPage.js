'use strict';

const fs = require('node:fs');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');

/**
 * One page of the Traveller5 rulebook as a PDF with uncompressed content, from which
 * the embedded greyscale bitmaps can be pulled out. Ghostscript does the rewriting.
 */
class BookPage {
  constructor(rulebookPdf, pageNumber, scratchFile, ghostscript) {
    execFileSync(ghostscript, [
      '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-dCompressPages=false',
      `-dFirstPage=${pageNumber}`, `-dLastPage=${pageNumber}`, `-sOutputFile=${scratchFile}`, rulebookPdf,
    ], { stdio: 'ignore' });
    this.raw = fs.readFileSync(scratchFile);
    this.text = this.raw.toString('latin1');
  }

  /** @returns {{x: number, y: number, width: number, height: number, name: string}[]} image placements, in points */
  placements() {
    const content = this.text.slice(this.text.indexOf('stream\n') + 7, this.text.indexOf('endstream'));
    return [...content.matchAll(/q ([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm\s*\/(R\d+) Do/g)].map((m) => ({
      width: Number(m[1]) / 10, height: Number(m[2]) / 10, x: Number(m[3]) / 10, y: Number(m[4]) / 10, name: m[5],
    }));
  }

  objectNumbers() {
    const reference = this.text.match(/\/XObject (\d+) 0 R/)[1];
    const start = this.text.indexOf(`\n${reference} 0 obj`);
    const dictionary = this.text.slice(start, this.text.indexOf('endobj', start));
    const numbers = {};
    for (const m of dictionary.matchAll(/\/(R\d+)\s+(\d+) 0 R/g)) numbers[m[1]] = Number(m[2]);
    return numbers;
  }

  /** The 8-bit greyscale pixels of an image object. */
  image(objectNumber) {
    const start = this.text.indexOf(`\n${objectNumber} 0 obj`);
    const streamAt = this.text.indexOf('stream', start);
    const header = this.text.slice(start, streamAt);
    const width = Number(header.match(/\/Width (\d+)/)[1]);
    const height = Number(header.match(/\/Height (\d+)/)[1]);
    const length = Number(header.match(/\/Length (\d+)/)[1]);
    const dataAt = streamAt + (this.text[streamAt + 6] === '\r' ? 8 : 7);
    const data = zlib.inflateSync(this.raw.subarray(dataAt, dataAt + length));
    return { width, height, pixels: BookPage.unfilter(data, width, height) };
  }

  /** Undoes the PNG-style row filters (/Predictor 15) used on one-byte pixels. */
  static unfilter(data, width, height) {
    const out = Buffer.alloc(width * height);
    for (let y = 0; y < height; y++) {
      const filter = data[y * (width + 1)];
      for (let x = 0; x < width; x++) {
        const raw = data[y * (width + 1) + 1 + x];
        const left = x > 0 ? out[y * width + x - 1] : 0;
        const up = y > 0 ? out[(y - 1) * width + x] : 0;
        const upLeft = x > 0 && y > 0 ? out[(y - 1) * width + x - 1] : 0;
        let value = raw;
        if (filter === 1) value = raw + left;
        else if (filter === 2) value = raw + up;
        else if (filter === 3) value = raw + ((left + up) >> 1);
        else if (filter === 4) {
          const pa = Math.abs(up - upLeft);
          const pb = Math.abs(left - upLeft);
          const pc = Math.abs(left + up - 2 * upLeft);
          value = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
        }
        out[y * width + x] = value & 255;
      }
    }
    return out;
  }
}

module.exports = BookPage;
