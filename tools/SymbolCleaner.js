'use strict';

const Components = require('./Components');

/**
 * Strips the frame and the caption from a book symbol bitmap, leaving only the symbol itself.
 * The frame is the one piece spanning the whole image. The caption is the lowest line of
 * three or more letter-sized pieces that share a baseline; dots and dashes that belong to a
 * symbol are either smaller than letters or sit above the caption.
 */
class SymbolCleaner {
  static LETTER_HEIGHT = [11, 17];
  static BASELINE_TOLERANCE = 4;

  /** @returns {{width: number, height: number, ink: Uint8Array}} ink is 1 where the symbol has ink */
  static clean(image) {
    const { label, boxes } = Components.find(image);
    const frame = boxes.filter((box) => box.width >= image.width * 0.9);
    const caption = SymbolCleaner.caption(boxes.filter((box) => !frame.includes(box)));
    const dropped = new Set([...frame, ...caption].map((box) => box.id));
    const ink = new Uint8Array(image.width * image.height);
    for (let i = 0; i < ink.length; i++) ink[i] = label[i] >= 0 && !dropped.has(label[i]) ? 1 : 0;
    return { width: image.width, height: image.height, ink };
  }

  static caption(boxes) {
    const [low, high] = SymbolCleaner.LETTER_HEIGHT;
    const letters = boxes.filter((box) => box.height >= low && box.height <= high && box.width <= 24);
    const lines = [];
    for (const box of letters.sort((a, b) => a.centreY - b.centreY)) {
      const line = lines.find((l) => Math.abs(l.centreY - box.centreY) <= SymbolCleaner.BASELINE_TOLERANCE);
      if (line) {
        line.boxes.push(box);
        line.centreY = line.boxes.reduce((sum, b) => sum + b.centreY, 0) / line.boxes.length;
      } else {
        lines.push({ centreY: box.centreY, boxes: [box] });
      }
    }
    const candidates = lines.filter((line) => line.boxes.length >= 3);
    if (!candidates.length) return [];
    return candidates.reduce((lowest, line) => (line.centreY > lowest.centreY ? line : lowest)).boxes;
  }
}

module.exports = SymbolCleaner;
