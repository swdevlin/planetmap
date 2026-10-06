'use strict';

/** Raised when the JSON describes something that cannot be drawn as a world map. */
class UnmappableWorldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnmappableWorldError';
  }
}

module.exports = UnmappableWorldError;
