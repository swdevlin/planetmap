'use strict';

const HexShape = require('./HexShape');
const SettlementFeature = require('./features/SettlementFeature');
const SvgDefs = require('./SvgDefs');

/**
 * Draws hexes. Each hex gets its own slight colour variation, chosen once so
 * that a hex drawn in two places on the map looks the same in both.
 */
class HexPainter {
  static COLOUR_SPREAD = 0.1;
  static PALE_COLOUR_SPREAD = 0.03;
  static PALE_FROM = 0.4;
  static PALE_TO = 0.9;

  constructor(rng) {
    this.rng = rng;
    this.shades = new WeakMap();
  }

  shadeOf(hex, role, terrain) {
    if (!this.shades.has(hex)) this.shades.set(hex, {});
    const shades = this.shades.get(hex);
    if (!shades[role]) shades[role] = terrain.colour.jittered(this.rng, HexPainter.spreadFor(terrain.colour)).toCss();
    return shades[role];
  }

  /**
   * How much a colour may vary. Pale colours vary less: independent changes to each
   * channel turn near-white into visible pinks, blues and greens.
   */
  static spreadFor(colour) {
    const t = Math.min(1, Math.max(0, (colour.paleness - HexPainter.PALE_FROM) / (HexPainter.PALE_TO - HexPainter.PALE_FROM)));
    return HexPainter.COLOUR_SPREAD - (HexPainter.COLOUR_SPREAD - HexPainter.PALE_COLOUR_SPREAD) * t;
  }

  /** The flat terrain colours of a cell, including any half-hex overlay. Texture and borders are layered separately. */
  paintFills(cell) {
    const { hex, x, y } = cell;
    let svg = this.shape(HexShape.points(x, y), `stroke:none;fill:${this.shadeOf(hex, 'base', hex.terrain)}`);
    if (hex.overlay) {
      const { side, terrain } = hex.overlay;
      svg += this.shape(HexShape.halfPoints(x, y, side), `stroke:none;fill:${this.shadeOf(hex, 'overlay', terrain)}`);
    }
    return svg;
  }

  /** The hex outline, and the edge of any half-hex overlay. */
  paintBorders(cell) {
    const { hex, x, y } = cell;
    const style = `fill:none;stroke:${HexShape.BORDER_COLOUR};stroke-width:1`;
    let svg = this.shape(HexShape.points(x, y), style);
    if (hex.overlay) svg += this.shape(HexShape.halfPoints(x, y, hex.overlay.side), style);
    return svg;
  }

  /** The areas of a cell that take each texture, as [texture, points] pairs. An overlay replaces the half of the base it covers. */
  textureAreas(cell) {
    const { hex, x, y } = cell;
    if (!hex.overlay) return [[hex.terrain.texture, HexShape.points(x, y)]];
    const { side, terrain } = hex.overlay;
    const otherSide = side === 'east' ? 'west' : 'east';
    return [
      [hex.terrain.texture, HexShape.halfPoints(x, y, otherSide)],
      [terrain.texture, HexShape.halfPoints(x, y, side)],
    ];
  }

  /** Features other than settlements; these sit under the cut that trims edge hexes. */
  paintFeatures(cell) {
    return this.draw(cell, (feature) => !(feature instanceof SettlementFeature));
  }

  /** Settlement symbols, drawn last so edge hexes never cut them. */
  paintSettlements(cell) {
    return this.draw(cell, (feature) => feature instanceof SettlementFeature);
  }

  draw(cell, wanted) {
    return cell.hex.features
      .filter(wanted)
      .map((feature) => feature.draw(cell.x, cell.y))
      .join('');
  }

  shape(points, style) {
    return `<polygon points="${points}" style="${style}"/>`;
  }
}

module.exports = HexPainter;
