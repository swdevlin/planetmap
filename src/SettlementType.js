'use strict';

/**
 * The kind of settlement, each with its own map symbol. A symbol is drawn
 * centred on the point (x, y).
 */
class SettlementType {
  static FILL = 'fill:white;stroke:black;stroke-width:1.5;stroke-linejoin:round';

  constructor(code, label, symbol) {
    this.code = code;
    this.label = label;
    this.symbol = symbol;
  }

  draw(x, y) {
    return this.symbol(x, y);
  }

  /** Reads a type from a JSON label: the code (Cw) or a phrase such as "World Capital". */
  static fromLabel(text) {
    const value = String(text || '').trim().toLowerCase();
    if (!value) return SettlementType.PLAIN;
    const match = SettlementType.ALL.find(
      (type) => type.code && (value === type.code.toLowerCase() || value.includes(type.label.split(' ')[0].toLowerCase()))
    );
    return match || SettlementType.PLAIN;
  }
}

function star(x, y, outer) {
  const inner = outer * 0.45;
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(`${(x + radius * Math.cos(angle)).toFixed(1)},${(y + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `<polygon points="${points.join(' ')}" style="${SettlementType.FILL}"/>`;
}

SettlementType.WORLD_CAPITAL = new SettlementType('Cw', 'World capital', (x, y) => star(x, y, 8));
SettlementType.FACTION_CAPITAL = new SettlementType(
  'Cf',
  'Faction capital',
  (x, y) => `<polygon points="${x},${y - 7} ${x + 6},${y} ${x},${y + 7} ${x - 6},${y}" style="${SettlementType.FILL}"/>`
);
SettlementType.NATIONAL_CAPITAL = new SettlementType(
  'Cn',
  'National capital',
  (x, y) => `<polygon points="${x},${y - 7} ${x + 7},${y + 5} ${x - 7},${y + 5}" style="${SettlementType.FILL}"/>`
);
SettlementType.REGIONAL_CAPITAL = new SettlementType(
  'Cr',
  'Regional capital',
  (x, y) => `<circle cx="${x}" cy="${y}" r="5" style="${SettlementType.FILL}"/>`
);
SettlementType.PLAIN = new SettlementType(
  null,
  'Settlement',
  (x, y) =>
    `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" style="${SettlementType.FILL}"/>`
);
SettlementType.ALL = [
  SettlementType.WORLD_CAPITAL,
  SettlementType.FACTION_CAPITAL,
  SettlementType.NATIONAL_CAPITAL,
  SettlementType.REGIONAL_CAPITAL,
  SettlementType.PLAIN,
];

module.exports = SettlementType;
