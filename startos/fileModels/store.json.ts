import { z, FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Package-internal state. Written only by our init + actions, so .const()
// gives automatic restart-on-change.
const storeConfigSchema = z.object({
  // Generated once at install; each is 32 random bytes as hex (openssl rand
  // -hex 32). They sign tokens and encrypt server-side secrets, so they must
  // stay stable across restarts and survive in the backed-up main volume.
  jwtSecret: z.string().catch(''),
  authJwtSecret: z.string().catch(''),
  encryptionServerKey: z.string().catch(''),
  pseudoKeyParamsKey: z.string().catch(''),
  valetTokenSecret: z.string().catch(''),
  // Public URL clients use to reach the files server. Set this to the address
  // you point your Standard Notes app at if you upload files. Empty = unset.
  filesServerUrl: z.string().catch(''),
})

export type StoreConfig = z.infer<typeof storeConfigSchema>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'start9/store.json' },
  storeConfigSchema,
)
