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
- **Premium Activation Mode:** temporarily exposes an unauthenticated endpoint used to grant a subscription to a self-hosted account (see [Premium features](#premium-features)). Leave it off except while activating; it also forces legacy sessions while enabled.

Saving the configuration restarts the service.

## Premium features

Standard Notes' premium features (the Super editor, extra themes, nested tags, larger uploads, etc.) are gated by a **subscription role** on your account. This package can grant that role at no cost, but a limitation imposed by the **Standard Notes apps** — not by this package — restricts where it takes effect.

### The first-party host limitation

The official Standard Notes apps only honor an online subscription when connected to one of their **first-party** sync hosts, which are hardcoded in the app:

- `api.standardnotes.com`
- `sync.standardnotes.org`
- `localhost:3123`

Any other sync server — including this self-hosted one at its StartOS address or your own domain — is treated as a **third-party host**, and the apps **ignore the online subscription for premium unlocking**. Your notes still sync perfectly; only the premium editors and themes stay locked. This is a client-side design decision and cannot be changed from the server.

Because `localhost:3123` is on that list, the workaround is to make this server reachable at `https://localhost:3123` on your computer (see [Unlocking premium on desktop](#unlocking-premium-on-desktop)).

### Granting the subscription

1. In the **Configure** action, turn **Premium Activation Mode** ON and save.
2. Grant your account a subscription. Run the following from a terminal on any computer that can reach the server's API address over the network and has the root CA file (for example your own laptop or desktop — not on the StartOS server itself, and not inside the app). Replace the email, CA path, and server address:

   ```sh
   curl --cacert /path/to/root-ca.crt -X POST https://<server-api-address>/e2e/activate-premium \
     -H 'Content-Type: application/json' \
     -d '{"username":"you@example.com","subscriptionId":1,"subscriptionPlanName":"PRO_PLAN","uploadBytesLimit":107374182400,"endsAt":4102444800000}'
   ```

   `endsAt` is a millisecond timestamp (the example is the year 2100). A `{"message":"Premium features activated."}` response means the `PRO_USER` role and subscription are stored in your data volume (and captured by backups).
3. Turn **Premium Activation Mode** OFF and save.

The grant persists across restarts, updates, and backups. By itself it unlocks nothing in the app until the app is connected through a first-party host.

### Unlocking premium on desktop

Premium unlocks only when the desktop app reaches the server at `https://localhost:3123`. Run a local proxy on port `3123` that forwards to your server, then point the app at it. There are two ways to set up the proxy, depending on which certificate your server's address presents.

#### Option A — forward to the StartOS address (StartOS certificate)

Use this when you connect to the server's StartOS LAN/clearnet address, which serves a certificate signed by your StartOS root CA. That certificate already includes a `localhost` SAN, so a plain TCP passthrough validates once the root CA is trusted (see [Trusting the HTTPS certificate](#trusting-the-https-certificate)).

One-off (stops when the terminal closes):

```sh
socat TCP-LISTEN:3123,reuseaddr,fork TCP:<server-ip>:<server-port>
```

Persistent (Linux, systemd user service):

```sh
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/sn-tunnel.service <<'EOF'
[Unit]
Description=Standard Notes localhost:3123 tunnel to StartOS
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:3123,reuseaddr,fork TCP:<server-ip>:<server-port>
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF
systemctl --user daemon-reload
systemctl --user enable --now sn-tunnel.service
loginctl enable-linger "$USER"   # keep it running across logout/reboot
```

The drawback is that `<server-ip>:<server-port>` is the StartOS address, which can change; update the service and run `systemctl --user restart sn-tunnel.service` if it does.

#### Option B — forward to a public domain (its own TLS certificate)

Use this when you front the server with a public domain (for example `notes.example.com`) that serves its own certificate, such as Let's Encrypt. A plain passthrough fails here: the app connects to `https://localhost:3123` but is handed a certificate for the domain, so the hostname does not match. Instead, terminate TLS at the proxy — present a self-signed `localhost` certificate to the app, and have `socat` open its own TLS connection out to the domain. This is also more stable, since it does not depend on the changing StartOS LAN address.

1. Generate a self-signed `localhost` certificate (once; reuse the files on every desktop):

   ```sh
   mkdir -p ~/.config/sn-tunnel && cd ~/.config/sn-tunnel
   openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
     -keyout localhost.key -out localhost.crt \
     -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
   cat localhost.crt localhost.key > localhost.pem
   ```

2. Trust `localhost.crt` in the app's trust store (snap NSS database shown; use `~/.pki/nssdb` for a non-snap install), then fully quit and reopen the app:

   ```sh
   certutil -d sql:"$HOME/snap/standard-notes/current/.pki/nssdb" -A -t "C,," \
     -n "Local localhost proxy" -i ~/.config/sn-tunnel/localhost.crt
   ```

   This is your own `localhost` certificate, not the StartOS root CA — do not import the StartOS CA for this option.

3. Run the TLS-terminating proxy as a systemd user service (replace `<your-domain>`):

   ```sh
   mkdir -p ~/.config/systemd/user
   cat > ~/.config/systemd/user/sn-tunnel.service <<'EOF'
   [Unit]
   Description=Standard Notes localhost:3123 TLS tunnel
   After=network-online.target
   Wants=network-online.target

   [Service]
   ExecStart=/usr/bin/socat OPENSSL-LISTEN:3123,reuseaddr,fork,cert=%h/.config/sn-tunnel/localhost.pem,verify=0 OPENSSL:<your-domain>:443,verify=1
   Restart=always
   RestartSec=3

   [Install]
   WantedBy=default.target
   EOF
   systemctl --user daemon-reload
   systemctl --user enable --now sn-tunnel.service
   loginctl enable-linger "$USER"
   ```

4. Verify the proxy (validating against your own certificate):

   ```sh
   curl --cacert ~/.config/sn-tunnel/localhost.crt https://localhost:3123/healthcheck
   ```

   An `OK` response means the proxy presents your `localhost` certificate and reaches the server.

With either option, set the desktop app's custom sync server to `https://localhost:3123`, sign out fully, and sign back in — the premium editors unlock. Sessions are bound to the address, so a session created against another address (the LAN or public domain) will not carry the unlock; sign in fresh on `localhost:3123`.

> `systemctl --user enable --now` does **not** restart an already-running service. If you change the unit file, run `systemctl --user restart sn-tunnel.service`. With a snap install, re-run the `certutil` import after each snap revision update.

### Limitations

- **Mobile and other devices:** there is no `localhost` server on a phone, so the tunnel cannot work there. Premium on the official mobile apps against a self-hosted server is not achievable.
- **Custom public domains (direct connection):** pointing the app straight at a domain such as `notes.example.com` is still a third-party host, so premium stays locked; sync works. You can, however, use that domain as the upstream for a `localhost:3123` tunnel (see **Option B** above), which does unlock premium.
- **Offline activation does not work here:** the home server's offline-features endpoint cannot identify the user in single-process mode, and the apps only accept `localhost` as an offline features host, so this path is a dead end.
- The only way to get tunnel-free premium (including on mobile) is to run a **patched Standard Notes app** that adds your host to its first-party allowlist — a separate project outside this package.

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
