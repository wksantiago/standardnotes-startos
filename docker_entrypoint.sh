#!/bin/sh
set -e

APP_DIR=/opt/server/packages/home-server
# home-server resolves its data directory as ${__dirname}/../data. The compiled
# entrypoint runs from dist/bin/server.js, so the live path is dist/data. Point
# that at the mounted volume so the SQLite database and uploads are persisted
# and captured by StartOS backups.
APP_DATA="$APP_DIR/dist/data"

mkdir -p /data/database /data/uploads
rm -rf "$APP_DATA"
ln -s /data "$APP_DATA"

# The files service requires Redis for its (short-lived) valet token store, even
# in home-server memory-cache mode. Run a local, non-persistent instance; no
# durable user data lives here (notes and auth are in SQLite).
redis-server --bind 127.0.0.1 --port 6379 --save '' --appendonly no --daemonize yes
export REDIS_URL=redis://localhost:6379

# StartOS exposes this service at a dynamic host (LAN IP, .local, Tor, clearnet).
# An empty cookie domain makes the session cookies host-only so they bind to
# whatever address the client uses; the upstream default of standardnotes.com
# would never match and breaks session refresh.
export COOKIE_DOMAIN=""

shutdown() {
  # Negative PID signals the whole process group so the node child receives
  # SIGTERM even though it is launched through the Yarn PnP runtime; the home
  # server installs its own graceful shutdown handler.
  [ -n "$APP_PID" ] && kill -TERM -"$APP_PID" 2>/dev/null || true
  wait "$APP_PID" 2>/dev/null || true
  redis-cli -h 127.0.0.1 -p 6379 shutdown nosave 2>/dev/null || true
  exit 0
}
trap shutdown TERM INT

cd "$APP_DIR"
setsid yarn node dist/bin/server.js &
APP_PID=$!
wait "$APP_PID"
