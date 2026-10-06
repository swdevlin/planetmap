'use strict';

const test = require('node:test');
const assert = require('node:assert');
const PlanetMapServer = require('../src/PlanetMapServer');
const { samplePlanet } = require('./helpers');

async function withServer(run) {
  const lines = [];
  const server = new PlanetMapServer({ port: 0, log: (line) => lines.push(line) });
  await server.start();
  try {
    await run(`http://127.0.0.1:${server.port}`, lines);
  } finally {
    await server.stop();
  }
}

const post = (url, body, headers = {}) =>
  fetch(`${url}/map`, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers });

test('POST /map returns an SVG and echoes the seed', () =>
  withServer(async (url) => {
    const response = await post(url, samplePlanet('size6.json'), { 'X-Planet-Seed': '12345' });
    assert.strictEqual(response.status, 200);
    assert.match(response.headers.get('content-type'), /image\/svg\+xml/);
    assert.strictEqual(response.headers.get('x-planet-seed'), '12345');
    assert.ok((await response.text()).startsWith('<svg'));
  }));

test('a random seed is reported in the response header', () =>
  withServer(async (url) => {
    const response = await post(url, samplePlanet('size6.json'));
    assert.ok(response.headers.get('x-planet-seed'));
  }));

test('each map call is logged with render time and SVG size', () =>
  withServer(async (url, lines) => {
    const response = await post(url, samplePlanet('size6.json'), { 'X-Planet-Seed': '42' });
    const body = await response.text();
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.strictEqual(lines.length, 1);
    assert.match(lines[0], /POST \/map 200 total_ms=[\d.]+ seed=42 render_ms=[\d.]+ svg_bytes=\d+/);
    assert.ok(lines[0].includes(`svg_bytes=${Buffer.byteLength(body)}`));
  }));

test('bad JSON is a 400 and unmappable worlds are a 422', () =>
  withServer(async (url) => {
    assert.strictEqual((await post(url, 'not json')).status, 400);
    assert.strictEqual((await post(url, samplePlanet('size6.json', { size_code: '0' }))).status, 422);
  }));

test('health, unknown paths and wrong methods', () =>
  withServer(async (url) => {
    assert.strictEqual((await fetch(`${url}/health`)).status, 200);
    assert.strictEqual((await fetch(`${url}/nope`)).status, 404);
    assert.strictEqual((await fetch(`${url}/map`)).status, 405);
  }));
