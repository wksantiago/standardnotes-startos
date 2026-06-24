# Standard Notes Server

Standard Notes Server is the self-hosted backend for the Standard Notes end-to-end encrypted notes apps. This package runs the all-in-one home server: a single process bundling sync, auth, files, and revisions, with an embedded SQLite database. Your encrypted notes, tags, and revision history live on your own server.

## First-time setup

1. **Find this server's address.** Open this service's page in StartOS and copy the **Server API** interface address. The LAN address is served over HTTPS using your server's own root CA, so its address looks like `https://<host>` (or `https://<ip>:<port>`).
2. **Trust the certificate** on the device you connect from (see [Trusting the HTTPS certificate](#trusting-the-https-certificate) below). This is the most common cause of a "Failed to fetch" error.
3. **Point your Standard Notes app at it.** In the Standard Notes app, open the account / advanced options, choose to use a custom sync server, and enter the address from step 1.
4. **Register an account.** Create your account from within the app. Your notes are encrypted on the client before they reach the server.

There is no web interface to open here — this package is the API backend that the Standard Notes apps connect to. You can use the official desktop, mobile, or web app (<https://app.standardnotes.com>), or self-host the web app separately (the `standardnotes/web` image; see <https://standardnotes.com/help/self-hosting/web-app>) and point it at this server.

## Trusting the HTTPS certificate

The Server API LAN address uses an HTTPS certificate signed by your StartOS server's own root CA. Clients reject this certificate until they trust that CA, which shows up as **"Failed to fetch"** when you try to sign in. Download your server's root CA from StartOS (**System → Root CA**, "Download Certificate") and install it on each device you connect from.

- **Most browsers / OSes:** install the CA into the system or browser trust store, then use the official web app or your browser.
- **Chromium / Electron on Linux** (this includes the **Standard Notes desktop app**): Chromium does not use the system CA store on Linux — it uses the NSS database. Add the CA with `certutil` (from `libnss3-tools`):

  ```sh
  certutil -d sql:"$HOME/.pki/nssdb" -A -t "C,," -n "StartOS Root CA" -i /path/to/root-ca.crt
  ```

  Fully quit and reopen the app afterward (Electron reads the trust store at startup).

- **Standard Notes installed as a snap:** snaps are confined and cannot read `~/.pki/nssdb`. Import the CA into the snap's own NSS database instead:

  ```sh
  certutil -d sql:"$HOME/snap/standard-notes/current/.pki/nssdb" -A -t "C,," \
    -n "StartOS Root CA" -i /path/to/root-ca.crt
  ```

  Note that snaps store this per revision, so the trust must be re-imported after the snap updates to a new revision.

To verify the certificate and address before touching the app:

```sh
curl --cacert /path/to/root-ca.crt https://<server-api-address>/healthcheck
```

A response with no certificate error means the server and CA are trusted; only the app's trust store remains.

## Configuration

Use the **Configure** action to set:

- **Files Server URL:** the public address clients use to reach the files server. Set this to the address you point your Standard Notes app at if you use file attachments. Leave blank to disable file uploads.

Saving the configuration restarts the service.

## Sessions and addresses

Session cookies issued by this server are host-only — they are bound to the exact address you connect to. If you reach the server at more than one address (for example the LAN address and a Tor or clearnet address), each address keeps its own session, so signing in on one will not carry over to another.

## Secrets

The server's signing and encryption secrets are generated automatically the first time the service is installed and are kept in the service's data volume. Do not lose them — they are required to read existing data. They are included in StartOS backups.

## Data and backups

All state — the SQLite database, uploaded files, and this package's settings — lives in the service's data volume and is captured by StartOS backups. Restoring a backup brings back your encrypted notes and account.

## Troubleshooting

- **"Failed to fetch" when signing in.** The client does not trust the server's certificate. Install the root CA on the device (see [Trusting the HTTPS certificate](#trusting-the-https-certificate)), and make sure you are using the HTTPS Server API address, not an `http://` one.
- **The app keeps asking for your password ("refresh your session").** This happens for a session created before the certificate/address was set up correctly; that session cannot be repaired. Sign out fully and sign back in to create a fresh session. Your notes are encrypted and remain safe on the server.

## Learn more

For general background on self-hosting Standard Notes, see the official docs: <https://standardnotes.com/help/self-hosting/docker>. Note that this package runs the all-in-one **home server** with an embedded database, so the external MySQL, Redis, and object-storage steps in those docs do not apply here.
