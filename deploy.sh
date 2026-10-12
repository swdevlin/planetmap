#!/usr/bin/env bash
# Blue/green deploy: rebuild the idle colour, wait for it to be healthy, then point nginx at it.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTIVE_FILE="$APP_DIR/.active_colour"
HEALTH_TIMEOUT=120

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "Missing $APP_DIR/.env; copy .env.example and fill it in." >&2
  exit 1
fi
set -a
# shellcheck source=.env.example
source .env
set +a
: "${BLUE_PORT:?set BLUE_PORT in .env}" "${GREEN_PORT:?set GREEN_PORT in .env}" "${NGINX_UPSTREAM:?set NGINX_UPSTREAM in .env}"
UPSTREAM_SNIPPET="$NGINX_UPSTREAM"

ACTIVE="$(cat "$ACTIVE_FILE" 2>/dev/null || echo blue)"
case "$ACTIVE" in
  blue)  NEW=green; OLD=blue;  NEW_PORT=$GREEN_PORT ;;
  green) NEW=blue;  OLD=green; NEW_PORT=$BLUE_PORT ;;
  *) echo "Unknown colour in $ACTIVE_FILE: $ACTIVE" >&2; exit 1 ;;
esac

echo "Current active colour: $ACTIVE"
echo "Deploying new colour:  $NEW (port $NEW_PORT)"

git pull --ff-only

docker compose build "$NEW"
docker compose up -d --no-deps --force-recreate "$NEW"

# -a so a container that has already crashed is still found.
CONTAINER="$(docker compose ps -a -q "$NEW")"
if [[ -z "$CONTAINER" ]]; then
  echo "No container found for $NEW; leaving $OLD live." >&2
  exit 1
fi
echo 'Waiting for new container to become healthy...'
deadline=$((SECONDS + HEALTH_TIMEOUT))
while true; do
  state="$(docker inspect -f '{{.State.Status}}' "$CONTAINER")"
  status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER")"
  [[ "$status" == 'healthy' ]] && break
  # A crash shows up as exited, or as restarting under the restart policy.
  if [[ "$status" == 'unhealthy' || "$state" =~ ^(exited|dead|restarting)$ ]] || (( SECONDS >= deadline )); then
    echo "New container is $state ($status); leaving $OLD live." >&2
    docker compose logs --tail 50 "$NEW" >&2
    docker compose stop "$NEW"
    exit 1
  fi
  sleep 2
done

# The container's own health check runs inside it, so also check the port nginx will use.
if ! curl -fsS "http://127.0.0.1:${NEW_PORT}/health" > /dev/null; then
  echo "New container is healthy but not reachable on host port $NEW_PORT; leaving $OLD live." >&2
  docker compose stop "$NEW"
  exit 1
fi

HAD_SNIPPET=false
if [[ -f "$UPSTREAM_SNIPPET" ]]; then
  sudo cp "$UPSTREAM_SNIPPET" "$UPSTREAM_SNIPPET.bak"
  HAD_SNIPPET=true
fi

sudo tee "$UPSTREAM_SNIPPET" > /dev/null <<EOF
upstream planetmap_backend {
  server 127.0.0.1:${NEW_PORT};
}
EOF

if ! sudo nginx -t; then
  echo 'nginx config test failed; restoring previous upstream.' >&2
  if [[ "$HAD_SNIPPET" == true ]]; then
    sudo mv "$UPSTREAM_SNIPPET.bak" "$UPSTREAM_SNIPPET"
  else
    sudo rm -f "$UPSTREAM_SNIPPET"
  fi
  docker compose stop "$NEW"
  exit 1
fi
sudo systemctl reload nginx

echo "$NEW" > "$ACTIVE_FILE"

# Stop but keep the old container so a rollback is just start + swap the snippet.
docker compose stop "$OLD" || true

echo "Traffic switched from $OLD to $NEW"