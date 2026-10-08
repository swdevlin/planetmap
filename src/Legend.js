'use strict';

const HexShape = require('./HexShape');
const HexVisibility = require('./HexVisibility');
const SvgDefs = require('./SvgDefs');
const Xml = require('./Xml');

/**
 * The legend shown beneath the map: one entry for each kind of terrain and
 * feature that actually appears on it, alphabetically. A hex
 * that is mostly hidden by the map's edges does not count as appearing.
 */
class Legend {
  static ROW_HEIGHT = 40;
  static CHARACTER_WIDTH = 7.5;
  static ICON_TO_LABEL = 24;
  static COLUMN_PADDING = 64;
  static MAX_COLUMNS = 7;

  constructor(world) {
    this.world = world;
    this.entries = this.collectEntries();
  }

  collectEntries() {
    const entries = new Map();
    const add = (label, icon) => entries.has(label) || entries.set(label, { label, icon });
    const terrainIcon = (terrain) => (x, y) => this.terrainHex(x, y, terrain);

    const visibility = new HexVisibility(this.world.grid);
    const shown = new Set(this.world.grid.cells.filter((cell) => visibility.isVisible(cell)).map((cell) => cell.hex));
    for (const hex of shown) {
      add(hex.terrain.label, terrainIcon(hex.terrain));
      if (hex.overlay) {
        const { side, terrain } = hex.overlay;
        add(`${terrain.label} ${side === 'east' ? 'East' : 'West'} Half Only`, (x, y) => this.halfHex(x, y, side, terrain));
      }
      for (const feature of hex.features) {
        add(feature.legendLabel, (x, y) => this.featureHex(x, y, feature));
      }
    }
    return [...entries.values()].sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
  }

  terrainHex(x, y, terrain) {
    const points = HexShape.points(x, y);
    return (
      `<polygon points="${points}" style="stroke: ${HexShape.BORDER_COLOUR}; stroke-width: 1; fill: ${terrain.colour.toCss()};"/>` +
      `<polygon points="${points}" style="stroke:none;pointer-events:none;fill:${SvgDefs.textureFor(terrain)}"/>`
    );
  }

  halfHex(x, y, side, terrain) {
    const half = HexShape.halfPoints(x, y, side);
    return (
      this.terrainHex(x, y, this.world.landTerrain) +
      `<polygon points="${half}" style="stroke: ${HexShape.BORDER_COLOUR}; stroke-width: 1; fill: ${terrain.colour.toCss()};"/>` +
      `<polygon points="${half}" style="stroke:none;pointer-events:none;fill:${SvgDefs.textureFor(terrain)}"/>`
    );
  }

  /** Features are shown on a white hex, whatever terrain they stand on in the map. */
  featureHex(x, y, feature) {
    const background = `<polygon points="${HexShape.points(x, y)}" style="stroke: ${HexShape.BORDER_COLOUR}; stroke-width: 1; fill: white;"/>`;
    return background + feature.draw(x, y);
  }

  /**
   * Draws the legend with its first row centred on `top`.
   * @returns {{svg: string, height: number}}
   */
  render(left, top, width) {
    const items = this.entries;
    const longest = Math.max(...items.map((item) => item.label.length));
    const columnWidth = longest * Legend.CHARACTER_WIDTH + Legend.COLUMN_PADDING;
    const columns = Math.max(1, Math.min(Legend.MAX_COLUMNS, Math.floor(width / columnWidth)));

    let svg = '';
    items.forEach((item, index) => {
      const x = left + HexShape.WIDTH / 2 + (index % columns) * columnWidth;
      const y = top + Math.floor(index / columns) * Legend.ROW_HEIGHT;
      svg += item.icon(x, y);
      svg += `<text style="font-size:1em;font-family:Arial, sans-serif;fill:black;" x="${x + Legend.ICON_TO_LABEL}" y="${y + 3}">${Xml.escape(item.label)}</text>`;
    });
    const rows = Math.ceil(items.length / columns);
    return { svg, height: (rows - 1) * Legend.ROW_HEIGHT + 40 };
  }
}

module.exports = Legend;
