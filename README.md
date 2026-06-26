# standardnotes-startos

StartOS package for the [Standard Notes](https://standardnotes.com) self-hosted [server](https://github.com/standardnotes/server) — the end-to-end encrypted notes sync backend.

This package runs the **home server**: the all-in-one self-host build of the Standard Notes server. It is a single Node process that bundles the sync, auth, files, and revisions services, backed by an embedded SQLite database and on-disk file storage. No external MySQL, Redis, or object storage is required. Point your Standard Notes desktop, mobile, or web app at this server to sync your encrypted notes on hardware you control.

Built from the upstream [`standardnotes/server`](https://github.com/standardnotes/server) monorepo (`@standardnotes/home-server` workspace), pinned as a git submodule.

## Building

This package targets **StartOS 0.4.x** and uses the StartOS TypeScript SDK.

```sh
git clone --recurse-submodules https://github.com/privkeyio/standardnotes-startos
cd standardnotes-startos
make            # produces standardnotes-server_x86_64.s9pk
make install    # installs to the host in ~/.startos/config.yaml
```

The `server` git submodule pins the upstream source built into the image. The `Dockerfile` builds the monorepo with Yarn (PnP) and runs `@standardnotes/home-server`.

## Structure

- `startos/` — package definition (manifest, main daemon, API interface, config store, action, i18n).
- `Dockerfile` — builds the upstream monorepo (`yarn install --immutable && yarn build`) and runs the home server.
- `docker_entrypoint.sh` — points the home server's data directory at the mounted volume, then starts the server.
- `server/` — upstream source as a git submodule.

## Configuration

The five server secrets (`JWT_SECRET`, `AUTH_JWT_SECRET`, `ENCRYPTION_SERVER_KEY`, `PSEUDO_KEY_PARAMS_KEY`, `VALET_TOKEN_SECRET`) are generated automatically at install and stored in the backed-up data volume. The **Configure** action exposes an optional **Files Server URL** for file uploads.

## CI

- **Build** (`.github/workflows/build.yml`): on PRs to `main` and manual dispatch, builds the `.s9pk` via Start9's shared workflow. Requires repo secret **`DEV_KEY`** (`start-cli init-key`).
- **Release** (`.github/workflows/release.yml`): on `v*.*` tags, builds and publishes. Requires `DEV_KEY` plus the registry/S3 vars and secrets.

See [`instructions.md`](instructions.md) for setup and usage.
