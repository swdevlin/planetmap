'use strict';

const Biosphere = require('./Biosphere');
const Climate = require('./Climate');
const Liquid = require('./Liquid');
const Settlement = require('./Settlement');
const SettlementType = require('./SettlementType');
const UnmappableWorldError = require('./UnmappableWorldError');

/**
 * The characteristics of a planet that matter for mapping, read from the
 * planet JSON. Everything else in the JSON is ignored.
 */
class PlanetProfile {
  static MINIMUM_GRID_SIZE = 5;
  static DEFAULT_TEMPERATURE = 288;

  static MAXIMUM_SIZE = 20;

  constructor(json) {
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new UnmappableWorldError('Planet JSON must be an object');
    }
    this.name = json.name || 'Unnamed world';
    this.size = PlanetProfile.digit(json.size_code ?? json.size_detail?.code);
    if (!(this.size >= 1 && this.size <= PlanetProfile.MAXIMUM_SIZE)) {
      throw new UnmappableWorldError(`Size ${json.size_code} worlds cannot be mapped`);
    }
    this.atmosphere = PlanetProfile.digit(json.atmosphere?.code);
    this.hydrographics = PlanetProfile.digit(json.hydrographics?.code);
    this.liquid = Liquid.named(json.hydrographics?.liquid?.value);
    this.population = PlanetProfile.digit(json.population?.code);
    this.government = PlanetProfile.digit(json.government?.code);
    this.lawLevel = PlanetProfile.digit(json.law_level?.code);
    this.techLevel = PlanetProfile.digit(json.tech_level?.code);
    this.starport = String(json.starport_code ?? json.starport?.code ?? 'X').toUpperCase();
    this.resourceRating = PlanetProfile.digit(json.resource_rating ?? json.population?.biological_data?.resource_rating?.code);
    this.tidallyLockedToStar = Boolean(json.tidal_lock) && /^star$/i.test(json.tidal_lock_target_type || '');
    this.extinctSophont = json.extinct_sophont === true || json.population?.extinct_sophont?.value === true;
    this.twilightZone = this.tidallyLockedToStar && json.twilight_zone === true;
    this.biosphere = Biosphere.from(json.biomass_rating ?? json.population?.biological_data?.biomass_rating?.value, this.atmosphere);
    this.climate = new Climate(Number(json.temperature ?? json.current_temperature) || PlanetProfile.DEFAULT_TEMPERATURE);
    this.settlements = PlanetProfile.settlementsIn(json);
  }

  /** Hexes along a triangle edge: one per size, but never fewer than five. */
  get gridSize() {
    return Math.max(PlanetProfile.MINIMUM_GRID_SIZE, this.size);
  }

  /** Kilometres per hex: 1,000 normally, or size x 200 on worlds smaller than the grid. */
  get hexKilometres() {
    return this.size < PlanetProfile.MINIMUM_GRID_SIZE ? this.size * 200 : 1000;
  }

  /**
   * Converts a count of rows near the poles into the grid in use. Worlds smaller than
   * the minimum grid are drawn with smaller hexes, so the same physical depth needs more rows.
   */
  polarRows(rows) {
    return Math.round((rows * this.gridSize) / Math.min(this.size, this.gridSize));
  }

  /** Dry worlds are desert everywhere. */
  get isDesert() {
    return this.atmosphere >= 2 && this.atmosphere <= 9 && this.hydrographics === 0;
  }

  /** Every ocean is ice field and every land frozen. */
  get isFrozenSolid() {
    return this.size >= 2 && this.size <= 9 && this.hydrographics >= 1 && this.climate.isFrozen;
  }

  /** Frozen near the poles only. */
  get isTundra() {
    return (
      this.size >= 6 && this.size <= 9 &&
      this.atmosphere >= 4 && this.atmosphere <= 9 &&
      this.hydrographics >= 3 && this.hydrographics <= 7 &&
      this.climate.isCold
    );
  }

  /** Thin air and water, so the water is locked in extra-large polar caps. */
  get isIceCapped() {
    return this.atmosphere <= 1 && this.hydrographics >= 1;
  }

  get isAgricultural() {
    return this.hasFarmableLand && this.population >= 5 && this.population <= 7;
  }

  get isFarming() {
    return this.hasFarmableLand && this.population >= 2 && this.population <= 6 && this.climate.isHabitable;
  }

  /** Somebody farms here, and the land and life can bear crops. */
  get hasCropland() {
    return (this.isAgricultural || this.isFarming) && this.biosphere.supportsCrops;
  }

  get hasFarmableLand() {
    return this.atmosphere >= 4 && this.atmosphere <= 9 && this.hydrographics >= 4 && this.hydrographics <= 8;
  }

  /** Nobody lives here now, but somebody evidently did: the tech level remains. */
  get hasDiedBack() {
    return this.population === 0 && this.government === 0 && this.lawLevel === 0 && this.techLevel > 0;
  }

  /** Dead civilisation or an extinct sophont: either leaves ruins. */
  get hasRuins() {
    return this.hasDiedBack || this.extinctSophont;
  }

  /** Whether the ice caps are drawn: not on tidally locked or too-hot worlds. */
  get hasIceCaps() {
    if (this.twilightZone) return false;
    return this.isIceCapped || (this.hydrographics >= 2 && this.climate.allowsIceCaps);
  }

  /** Hexes marked as resources: one at rating 6, two at 7-8, three at 9-10 and four at 11 or more. */
  get resourceHexes() {
    if (this.resourceRating < 6) return 0;
    return Math.min(4, Math.floor((this.resourceRating - 3) / 2));
  }

  get hasStarport() {
    return /^[A-E]$/.test(this.starport);
  }

  /** A numeric characteristic that may arrive as a number or as a hex digit such as "A". */
  static digit(value) {
    if (typeof value === 'number') return Math.trunc(value);
    const parsed = parseInt(String(value ?? ''), 36);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  static settlementsIn(json) {
    const cities = Array.isArray(json.population?.cities) ? json.population.cities : [];
    const declared = cities.length || Number(json.city_count ?? json.population?.major_cities?.value) || 0;
    const settlements = [];
    for (let i = 0; i < declared; i++) {
      const city = cities[i] || {};
      const name = String(city.name || '').trim() || `Settlement ${i + 1}`;
      const type = SettlementType.fromLabel(city.type_label || city.capital_label);
      settlements.push(new Settlement(name, type));
    }
    return settlements;
  }
}

module.exports = PlanetProfile;
