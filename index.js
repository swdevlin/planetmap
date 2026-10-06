'use strict';

const PlanetMapServer = require('./src/PlanetMapServer');

const server = new PlanetMapServer({ port: Number(process.env.PORT) || 3013 });
server.start();

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.stop().then(() => process.exit(0)));
}
