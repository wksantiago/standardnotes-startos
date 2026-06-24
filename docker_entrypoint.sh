#!/bin/sh
set -e

APP_DATA=/opt/server/packages/home-server/data

# home-server resolves its SQLite database and file uploads under
# packages/home-server/data. Point that at the mounted volume so all state is
# captured by StartOS backups.
mkdir -p /data/database /data/uploads
rm -rf "$APP_DATA"
ln -s /data "$APP_DATA"

# The files service requires Redis for its (short-lived) valet token store, even
# in home-server memory-cache mode. Run a local, non-persistent instance; no
# durable user data lives here (notes and auth are in SQLite).
redis-server --bind 127.0.0.1 --port 6379 --save '' --appendonly no --daemonize yes
export REDIS_URL=redis://localhost:6379

cd /opt/server/packages/home-server
exec yarn node dist/bin/server.js
