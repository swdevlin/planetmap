'use strict';

const IslandFeature = require('./features/IslandFeature');
const Terrain = require('./Terrain');

/**
 * One world hex. A hex that appears at more than one place on the flattened
 * map (the poles, and hexes on the east/west wrap) is still a single Hex, so
 * every place it is drawn shows the same terrain and features.
 */
class Hex {
  constructor(row) {
    this.row = row;
    this.terrain = Terrain.CLEAR;
    this.features = [];
    this.overlay = null;
    this.triangle = null;
    this.cells = [];
    this.isPole = false;
  }

  addFeature(feature) {
    if (!this.hasFeature(feature.key)) this.features.push(feature);
    return this;
  }

  hasFeature(key) {
    return this.features.some((feature) => feature.key === key);
  }

  removeFeature(key) {
    this.features = this.features.filter((feature) => feature.key !== key);
    return this;
  }

  hasFeatureOf(featureClass) {
    return this.features.some((feature) => feature instanceof featureClass);
  }

  removeFeatureOf(featureClass) {
    this.features = this.features.filter((feature) => !(feature instanceof featureClass));
    return this;
  }

  /** Records that the east or west half of the hex is a different terrain. */
  paintHalf(side, terrain) {
    this.overlay = { side, terrain };
  }

  get isWater() {
    return this.terrain.isWater;
  }

  get isIceCap() {
    return this.terrain === Terrain.ICE_CAP;
  }

  /** Land for the purposes of placing things: dry terrain, or an island in the ocean. */
  get isDry() {
    return !this.isWater || this.hasFeatureOf(IslandFeature);
  }
}

module.exports = Hex;
