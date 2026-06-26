import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v0_1_1_0 = VersionInfo.of({
  version: '0.1.1:0',
  releaseNotes: {
    en_US:
      'Relicense to MIT, update packageRepo, and expand instructions with the public-domain premium tunnel.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
