# planetmap

A small Node.js web service that draws a world map for the Traveller5 role-playing game. Send it a
planet's JSON characteristics and it answers with an SVG: a flattened icosahedron of hexes, each with
a terrain and features, plus settlements, a starport and a legend. The procedure follows the Traveller5
world-map rules, with the changes described below.

## Using the service

```
POST /map
X-Planet-Seed: any-string        (optional)
Content-Type: application/json

{ ...the planet's JSON... }
```

- The body is the planet's JSON object exactly as the planet endpoint returns it. Send it as the
  top-level object, not wrapped and not in an array.
- The same planet and seed always give the same map. Leave the header out for a random seed. The seed
  that was used comes back in the `X-Planet-Seed` response header.
- A successful call returns `200` with `image/svg+xml`.
- Errors are JSON, `{"error": "..."}`:

| Status | Meaning |
|---|---|
| 400 | The body is not valid JSON, or the seed is longer than 200 characters |
| 405 | Wrong method (`/map` accepts `POST` only) |
| 413 | The body is larger than 2 MB |
| 422 | The planet cannot be mapped: the body is not a JSON object, or `size_code` is outside 1-20 |
| 500 | Unexpected failure |

`GET /health` returns `{"status":"ok"}`. Every request is logged with the seed, the time taken to render
and the size of the SVG returned.

```sh
curl -X POST --data-binary @testdata/size6.json -H "X-Planet-Seed: demo" http://localhost:3013/map > size6.svg
```

## What the map uses from the JSON

The profile reads only what the map needs, and ignores the rest.

| Drives | JSON fields |
|---|---|
| Grid size | `size_code` (at least 5 hexes per triangle edge; smaller worlds use smaller hexes and the legend says so) |
| Oceans, deserts, ice caps | `hydrographics.code`, `hydrographics.liquid.value`, `atmosphere.code` |
| Climate (frozen, tundra, baked) | `temperature` (or `current_temperature`) |
| Tidally locked worlds | `tidal_lock`, `tidal_lock_target_type` (must be `Star`), `twilight_zone` |
| Life | `biomass_rating` |
| Cropland | `population.code`, plus the atmosphere, hydrographics and biomass above |
| Ruins | `extinct_sophont`, or an empty world that kept a tech level |
| Settlements | `population.cities` or `city_count` (names and capital types when given) |
| Starport | `starport_code` |
| Wasteland | `tech_level.code` |
| Resources | `resource_rating` |

### Differences from the book

- **No trade codes.** The rules lean on trade codes; here the planet itself answers questions such as
  `isDesert`, `isFrozenSolid`, `hasIceCaps` and `hasCropland`.
- **Resources follow the resource rating.** The book places one resource in each of Resource-factor
  triangles, on free land. Here the count comes from `resource_rating`: one hex at 6, two at 7 or 8,
  three at 9 or 10 and four at 11 or more (none below 6). A resource can go on any hex, land or water,
  even one that already carries another feature.
- **Life shades the land.** Biomass ranks from bare ground (0 or less) through the book's olive Clear
  to deep green (10 and up). Life in an atmosphere hostile to Terran life (0, 1, A, B, C, F+) is tinted
  violet instead, and crops need a Terran biosphere with a rating of at least 3. Without a biomass
  rating the map is drawn as the rulebook would draw it.
- **Tidal locking** counts only when the world is locked to a star, and the twilight zone is drawn only
  when the JSON says it has one (a 3:2 resonance, for example, has none).
- **Oceans** of liquids other than water are coloured by liquid.
- **Settlements** on tidally locked worlds are placed along the twilight zones.

## Running it

Needs Node.js 20 or later. The service has no runtime dependencies.

```sh
npm start                 # listens on port 3013, or $PORT
npm test
```

### Docker

```sh
docker build -t planetmap .
docker run -p 3013:3013 planetmap
```

`docker-compose.yml` defines a blue/green pair on ports 3001 and 3002. Run both, point the front proxy
at whichever is live, and rebuild the idle colour first: `docker compose up -d --build green`. The image
has a health check on `/health` that deployment tooling can wait for before switching traffic.

## Layout

| Path | What is there |
|---|---|
| `src/PlanetProfile.js` | The planet's characteristics, and the questions the steps ask of it |
| `src/Biosphere.js` | Native life: land colour, alien life and cropland |
| `src/WorldBuilder.js` | Runs the generation steps in rulebook order |
| `src/steps/` | One class per step of the procedure |
| `src/features/` | Hex features, their vector-display symbols, and the book's symbols they redraw |
| `src/MapRenderer.js`, `src/Legend.js` | SVG output |
| `testdata/` | Sample planets, including a size 6 world and a tidally locked one |
| `tools/` | Rebuilds `src/features/bookSymbols.json` from your own copy of the rulebook |

## Licence

The code is released under the [MIT licence](LICENSE). That licence covers the code only, not the
Traveller material described below.

The symbols in `src/features/bookSymbols.json` are traced from the Traveller5 rulebook, which is not
included in this repository. The map draws redrawn vector versions of them (`src/features/VectorSymbol.js`).

### Far Future Enterprises license

The Traveller game in all forms is owned by Far Future Enterprises. Copyright 1977 - 2023 Far Future Enterprises.
Traveller is a registered trademark of Far Future Enterprises. Far Future permits websites and fanzines for this game,
provided it contains this notice, that Far Future is notified, and subject to a withdrawal of permission on 90 days notice.
