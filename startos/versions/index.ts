import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_2026_8_24_3 } from './v2026.8.24_3'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_2026_8_24_3],
})
