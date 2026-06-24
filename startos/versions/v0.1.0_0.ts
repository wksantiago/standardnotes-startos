import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v0_1_0_0 = VersionInfo.of({
  version: '0.1.0:0',
  releaseNotes: {
    en_US: 'Initial release of Standard Notes Server for StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
