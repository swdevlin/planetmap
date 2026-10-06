'use strict';

const http = require('node:http');
const HttpError = require('./HttpError');
const MapService = require('./MapService');
const UnmappableWorldError = require('./UnmappableWorldError');

/**
 * The HTTP face of the service:
 *   POST /map     planet JSON body, optional X-Planet-Seed header -> image/svg+xml
 *   GET  /health  liveness check for the deployment
 * The response to /map carries an X-Planet-Seed header with the seed used, so a
 * map drawn with a random seed can be reproduced.
 */
class PlanetMapServer {
  static MAX_BODY_BYTES = 2 * 1024 * 1024;
  static MAX_SEED_LENGTH = 200;

  constructor({ port = 3013, service = new MapService(), log = (line) => console.log(line) } = {}) {
    this.port = port;
    this.service = service;
    this.log = log;
    this.server = http.createServer((request, response) => this.handle(request, response));
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        this.port = this.server.address().port;
        console.log(`planetmap listening on port ${this.port}`);
        resolve(this);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.server.close(() => resolve());
      this.server.closeIdleConnections?.();
    });
  }

  async handle(request, response) {
    const started = performance.now();
    response.on('finish', () => this.logCall(request, response, started));
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      if (path === '/health') return this.health(request, response);
      if (path === '/map' || path === '/') return await this.map(request, response);
      this.reply(response, 404, { error: 'Not found' });
    } catch (error) {
      this.fail(response, error);
    }
  }

  /** One line per call: when, what, status, and for maps the seed, render time and SVG size. */
  logCall(request, response, started) {
    const parts = [
      new Date().toISOString(),
      request.method,
      request.url,
      response.statusCode,
      `total_ms=${(performance.now() - started).toFixed(1)}`,
    ];
    const stats = response.mapStats;
    if (stats) parts.push(`seed=${stats.seed}`, `render_ms=${stats.renderMs.toFixed(1)}`, `svg_bytes=${stats.bytes}`);
    this.log(parts.join(' '));
  }

  health(request, response) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return this.methodNotAllowed(response, 'GET');
    this.reply(response, 200, { status: 'ok' });
  }

  async map(request, response) {
    if (request.method !== 'POST') return this.methodNotAllowed(response, 'POST');
    const seed = request.headers['x-planet-seed'];
    if (seed && seed.length > PlanetMapServer.MAX_SEED_LENGTH) return this.reply(response, 400, { error: 'X-Planet-Seed is too long' });

    const planet = this.parseJson(await this.readBody(request));
    const result = this.service.render(planet, seed);
    response.mapStats = { seed: result.seed, renderMs: result.renderMs, bytes: result.bytes };
    response.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'X-Planet-Seed': result.seed,
      'Cache-Control': 'no-store',
    });
    response.end(result.svg);
  }

  readBody(request) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      request.on('data', (chunk) => {
        size += chunk.length;
        if (size > PlanetMapServer.MAX_BODY_BYTES) {
          reject(new HttpError(413, 'Request body too large'));
          request.destroy();
        } else {
          chunks.push(chunk);
        }
      });
      request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      request.on('error', reject);
    });
  }

  parseJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      throw new HttpError(400, 'Request body is not valid JSON');
    }
  }

  methodNotAllowed(response, allowed) {
    response.setHeader('Allow', allowed);
    this.reply(response, 405, { error: 'Method not allowed' });
  }

  reply(response, status, body) {
    if (response.headersSent) return response.end();
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(body));
  }

  fail(response, error) {
    if (error instanceof HttpError) return this.reply(response, error.status, { error: error.message });
    if (error instanceof UnmappableWorldError) return this.reply(response, 422, { error: error.message });
    console.error(error);
    this.reply(response, 500, { error: 'Internal server error' });
  }
}

module.exports = PlanetMapServer;
