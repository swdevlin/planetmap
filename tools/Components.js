'use strict';

/** Connected groups of ink pixels (8-connected) in a greyscale bitmap where ink is bright. */
class Components {
  static find({ width, height, pixels }, threshold = 128) {
    const label = new Int32Array(width * height).fill(-1);
    const found = [];
    for (let start = 0; start < width * height; start++) {
      if (pixels[start] < threshold || label[start] !== -1) continue;
      const id = found.length;
      const stack = [start];
      label[start] = id;
      const box = { minX: width, minY: height, maxX: 0, maxY: 0, area: 0, id };
      while (stack.length) {
        const at = stack.pop();
        const x = at % width;
        const y = (at - x) / width;
        box.area++;
        box.minX = Math.min(box.minX, x); box.maxX = Math.max(box.maxX, x);
        box.minY = Math.min(box.minY, y); box.maxY = Math.max(box.maxY, y);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx; const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const next = ny * width + nx;
            if (pixels[next] >= threshold && label[next] === -1) { label[next] = id; stack.push(next); }
          }
        }
      }
      box.width = box.maxX - box.minX + 1;
      box.height = box.maxY - box.minY + 1;
      box.centreY = (box.minY + box.maxY) / 2;
      found.push(box);
    }
    return { label, boxes: found };
  }
}

module.exports = Components;
