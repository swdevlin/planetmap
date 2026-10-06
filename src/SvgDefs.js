'use strict';

const LAND_FILTER =
  '<filter id="hexTextureLandFilter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
  '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="7" stitchTiles="stitch" result="noise"/>' +
  '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 -0.45" result="dark"/>' +
  '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.9 0 0 0 0.45" result="light"/>' +
  '<feMerge><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge></filter>';

const LAND_PATTERN =
  '<pattern id="hexTextureLand" patternUnits="userSpaceOnUse" width="192" height="192">' +
  '<rect width="192" height="192" filter="url(#hexTextureLandFilter)"/></pattern>';

const WATER_FILTER =
  '<filter id="hexTextureWaterFilter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
  '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.07" numOctaves="3" seed="11" stitchTiles="stitch" result="noise"/>' +
  '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 -0.45" result="dark"/>' +
  '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.9 0 0 0 0.45" result="light"/>' +
  '<feMerge><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge></filter>';

const WATER_PATTERN =
  '<pattern id="hexTextureWater" patternUnits="userSpaceOnUse" width="192" height="192">' +
  '<rect width="192" height="192" filter="url(#hexTextureWaterFilter)"/></pattern>';

/**
 * Reusable SVG definitions: the noise filters and patterns that give land and
 * water hexes their texture.
 */
class SvgDefs {
  static markup() {
    return `<defs>${LAND_FILTER}${LAND_PATTERN}${WATER_FILTER}${WATER_PATTERN}</defs>`;
  }

  /** The fill that overlays the texture for a terrain, as a url() reference. */
  static textureFor(terrain) {
    return terrain.texture === 'water' ? 'url(#hexTextureWater)' : 'url(#hexTextureLand)';
  }
}

module.exports = SvgDefs;
