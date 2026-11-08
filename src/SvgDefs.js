'use strict';

// Each textured polygon carries the noise filter directly (no tiled <pattern>).
// feTurbulence samples noise in map coordinates, so neighbouring hexes get
// continuous noise and there are no tile seams. The noise is clipped to the
// polygon with SourceAlpha.
const noiseFilter = (id, frequency, octaves, seed) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" seed="${seed}" result="noise"/>` +
  '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 -0.45" result="dark"/>' +
  '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.9 0 0 0 0.45" result="light"/>' +
  '<feMerge result="texture"><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge>' +
  '<feComposite in="texture" in2="SourceAlpha" operator="in"/></filter>';

const LAND_FILTER = noiseFilter('hexTextureLand', '0.045', 4, 7);
const WATER_FILTER = noiseFilter('hexTextureWater', '0.012 0.07', 3, 11);

// A tight, faint halo under each map symbol's stroke, like the bloom on a vector display.
const PHOSPHOR_FILTER =
  '<filter id="phosphor" x="-50%" y="-50%" width="200%" height="200%">' +
  '<feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur"/>' +
  '<feComponentTransfer in="blur" result="halo"><feFuncA type="linear" slope="0.6"/></feComponentTransfer>' +
  '<feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

/**
 * Reusable SVG definitions: the noise filters and patterns that give land and
 * water hexes their texture, and the glow on map symbols.
 */
class SvgDefs {
  static markup() {
    return `<defs>${LAND_FILTER}${WATER_FILTER}${PHOSPHOR_FILTER}</defs>`;
  }

  /**
   * One texture laid over the whole map at once, clipped to the given polygons.
   * The noise filter runs once per texture instead of once per hex.
   */
  static layer(texture, polygons, area) {
    if (!polygons.length) return '';
    const id = texture === 'water' ? 'hexTextureWater' : 'hexTextureLand';
    const clip = `${id}Clip`;
    const shapes = polygons.map((points) => `<polygon points="${points}"/>`).join('');
    return (
      `<clipPath id="${clip}">${shapes}</clipPath>` +
      `<rect x="${area.x}" y="${area.y}" width="${area.width}" height="${area.height}" style="fill:#000;stroke:none;pointer-events:none;filter:url(#${id})" clip-path="url(#${clip})"/>`
    );
  }

  /** The style declarations that overlay the texture for a terrain. */
  static textureFor(terrain) {
    const id = terrain.texture === 'water' ? 'hexTextureWater' : 'hexTextureLand';
    return `fill:#000;filter:url(#${id})`;
  }
}

module.exports = SvgDefs;
