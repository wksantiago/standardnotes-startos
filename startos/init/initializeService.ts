import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  // Seed defaults on every init so new schema defaults apply on upgrade.
  await storeJson.merge(effects, {})

  if (kind !== 'install') return

  // Generate the server secrets once at install. Each is 64 hex chars (32
  // bytes), matching `openssl rand -hex 32`. They live in the backed-up main
  // volume's store.json.
  const secret = () => utils.getDefaultString({ charset: 'a-f,0-9', len: 64 })
  await storeJson.merge(effects, {
    jwtSecret: secret(),
    authJwtSecret: secret(),
    encryptionServerKey: secret(),
    pseudoKeyParamsKey: secret(),
    valetTokenSecret: secret(),
  })
})
