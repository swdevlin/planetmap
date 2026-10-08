'use strict';

const HexPainter = require('./HexPainter');
const HexShape = require('./HexShape');
const Legend = require('./Legend');
const SettlementFeature = require('./features/SettlementFeature');
const SvgDefs = require('./SvgDefs');
const Xml = require('./Xml');

/** Draws a built world as one SVG document: map, reference marks and legend. */
class MapRenderer {
  static SIDE_MARGIN = 24;
  static TOP_MARGIN = 24;
  static LEGEND_GAP = 56;

  constructor(world) {
    this.world = world;
    this.grid = world.grid;
    this.painter = new HexPainter(world.rng);
    this.legend = new Legend(world);
  }

  render() {
    const grid = this.grid;
    const viewX = grid.left - MapRenderer.SIDE_MARGIN;
    const viewY = grid.top - MapRenderer.TOP_MARGIN;
    const viewWidth = grid.width + 2 * MapRenderer.SIDE_MARGIN;
    const legend = this.legend.render(grid.left - 4, grid.bottom + MapRenderer.LEGEND_GAP, grid.width);
    const viewHeight = grid.bottom + MapRenderer.LEGEND_GAP + legend.height - viewY;

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="${viewX} ${viewY} ${viewWidth} ${viewHeight}">` +
      `<title>${Xml.escape(this.world.name)}</title>` +
      SvgDefs.markup() +
      `<clipPath id="mapWindow"><rect x="${grid.left}" y="${grid.top}" width="${grid.width}" height="${grid.bottom - grid.top}"/></clipPath>` +
      `<rect x="${viewX}" y="${viewY}" width="${viewWidth}" height="${viewHeight}" fill="white"/>` +
      `<g clip-path="url(#mapWindow)">${this.terrain()}${this.features()}${this.gaps()}${this.outlines()}${this.equator()}${this.settlementSymbols()}</g>` +
      this.scale() +
      this.settlementLabels() +
      legend.svg +
      '</svg>'
    );
  }

  terrain() {
    return this.grid.cells.map((cell) => this.painter.paintTerrain(cell)).join('');
  }

  features() {
    return this.grid.cells.map((cell) => this.painter.paintFeatures(cell)).join('');
  }

  settlementSymbols() {
    return this.grid.cells.map((cell) => this.painter.paintSettlements(cell)).join('');
  }

  /** White triangles over the empty spaces between the caps, hiding the outer half of edge hexes. */
  gaps() {
    return this.grid.gaps
      .map(([a, b, c]) => `<path d="M ${a.join(' ')} L ${b.join(' ')} L ${c.join(' ')}" style="stroke-width:2;stroke:${HexShape.BORDER_COLOUR};fill:white"/>`)
      .join('');
  }

  /** A hex with the distance across it, in the blank space between the third and fourth south cap triangles. */
  scale() {
    const grid = this.grid;
    const x = grid.left + 3 * HexShape.WIDTH * grid.size;
    const y = grid.rowY(2 * grid.size) + (2 / 3) * (grid.bottom - grid.rowY(2 * grid.size));
    const km = this.world.profile.hexKilometres.toLocaleString('en-US');
    const arrow = [
      [-14, 0, 14, 0],
      [-14, 0, -11, -3],
      [-14, 0, -11, 3],
      [11, -3, 14, 0],
      [11, 3, 14, 0],
    ]
      .map(([x1, y1, x2, y2]) => `<line x1="${x + x1}" y1="${y + y1}" x2="${x + x2}" y2="${y + y2}" stroke-width="2px" stroke="black"/>`)
      .join('');
    return (
      `<polygon points="${HexShape.points(x, y)}" style="stroke: ${HexShape.BORDER_COLOUR}; stroke-width: 1; fill: white;"/>${arrow}` +
      `<text style="font-size:8px;font-family:Arial, sans-serif;fill:black;" text-anchor="middle" x="${x}" y="${y + 10}">${km} km</text>`
    );
  }

  /** Dashed line round the middle of the world. */
  equator() {
    const grid = this.grid;
    const y = grid.rowY(1.5 * grid.size);
    return `<line x1="${grid.left}" y1="${y}" x2="${grid.right}" y2="${y}" stroke-width="1" stroke="black" stroke-dasharray="5,5"/>`;
  }

  outlines() {
    return this.grid.extendedTriangles
      .map((triangle) => this.polygon(triangle.vertices, `stroke:${HexShape.BORDER_COLOUR};stroke-width:2;fill:none`))
      .join('');
  }

  polygon(vertices, style) {
    return `<polygon points="${vertices.map((point) => point.join(',')).join(' ')}" style="${style}"/>`;
  }

  /** Each settlement's name, drawn once beside its first appearance on the map. */
  settlementLabels() {
    let svg = '';
    for (const hex of this.grid.hexes) {
      const cell = hex.cells[0];
      for (const feature of hex.features) {
        if (feature instanceof SettlementFeature) svg += feature.label(cell.x, cell.y);
      }
    }
    return svg;
  }
}

module.exports = MapRenderer;
