import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Standard Notes Server'))

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error('no store.json')

  // The home server runs as a single Node process with an embedded SQLite
  // database and on-disk file storage. The entrypoint points the data
  // directory at the mounted volume so all state is captured by backups.
  const env: Record<string, string> = {
    NODE_ENV: 'production',
    PORT: `${uiPort}`,
    JWT_SECRET: store.jwtSecret,
    AUTH_JWT_SECRET: store.authJwtSecret,
    ENCRYPTION_SERVER_KEY: store.encryptionServerKey,
    PSEUDO_KEY_PARAMS_KEY: store.pseudoKeyParamsKey,
    VALET_TOKEN_SECRET: store.valetTokenSecret,
  }
  if (store.filesServerUrl) env.FILES_SERVER_URL = store.filesServerUrl

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'standardnotes-server' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'standardnotes-server',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: { command: ['/usr/local/bin/docker_entrypoint.sh'], env },
    ready: {
      display: i18n('Server API'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          `http://localhost:${uiPort}/healthcheck`,
          {
            successMessage: i18n('The Standard Notes Server is ready'),
            errorMessage: i18n('The Standard Notes Server is not responding'),
          },
        ),
    },
    requires: [],
  })
})
