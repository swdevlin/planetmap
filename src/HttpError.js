'use strict';

/** An error that should be reported to the client with a specific HTTP status. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
