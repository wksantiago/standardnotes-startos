# Standard Notes Server

Standard Notes Server is the self-hosted backend for the Standard Notes end-to-end encrypted notes apps. This package runs the all-in-one home server: a single process bundling sync, auth, files, and revisions, with an embedded SQLite database. Your encrypted notes, tags, and revision history live on your own server.

## First-time setup

1. **Find this server's address.** Open this service's page in StartOS and copy the **Server API** interface address.
2. **Point your Standard Notes app at it.** In the Standard Notes desktop, mobile, or web app, open the account / sync server settings, choose to use a custom sync server, and enter the address from step 1.
3. **Register an account.** Create your account from within the app. Your notes are encrypted on the client before they reach the server.

There is no web interface to open here — this package is the API backend that the Standard Notes apps connect to. You can use the official desktop, mobile, or web app (<https://app.standardnotes.com>), or self-host the web app separately (the `standardnotes/web` image; see <https://standardnotes.com/help/self-hosting/web-app>) and point it at this server.

## Configuration

Use the **Configure** action to set:

- **Files Server URL:** the public address clients use to reach the files server. Set this to the address you point your Standard Notes app at if you use file attachments. Leave blank to disable file uploads.

Saving the configuration restarts the service.

## Secrets

The server's signing and encryption secrets are generated automatically the first time the service is installed and are kept in the service's data volume. Do not lose them — they are required to read existing data. They are included in StartOS backups.

## Data and backups

All state — the SQLite database, uploaded files, and this package's settings — lives in the service's data volume and is captured by StartOS backups. Restoring a backup brings back your encrypted notes and account.

## Learn more

For general background on self-hosting Standard Notes, see the official docs: <https://standardnotes.com/help/self-hosting/docker>. Note that this package runs the all-in-one **home server** with an embedded database, so the external MySQL, Redis, and object-storage steps in those docs do not apply here.
