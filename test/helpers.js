'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** Loads one of the sample planets, optionally changing parts of it. */
function samplePlanet(file, changes = {}) {
  const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'testdata', file), 'utf8'));
  return Object.assign(json, changes);
}

module.exports = { samplePlanet };
