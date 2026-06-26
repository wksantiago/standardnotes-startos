import { VersionGraph } from '@start9labs/start-sdk'
import { v0_1_0_0 } from './v0.1.0_0'
import { v0_1_1_0 } from './v0.1.1_0'

export const versionGraph = VersionGraph.of({
  current: v0_1_1_0,
  other: [v0_1_0_0],
})
