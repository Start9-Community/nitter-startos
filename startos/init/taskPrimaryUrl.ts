import {
  primaryUrl,
  readPrimaryUrl,
  writePrimaryUrl,
} from '../actions/setPrimaryUrl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getNonLocalUrls } from '../utils'

export const syncPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const stored = await readPrimaryUrl.const(effects)
  const url = stored
    ? // fallback: false makes this the stored URL at its host's current port and scheme, or null
      await primaryUrl.bestUsable(effects).const()
    : await getNonLocalUrls(effects).then(
        (urls) =>
          urls.find((u) => new URL(u).hostname.endsWith('.local')) ?? urls[0],
      )
  if (url && url !== stored) {
    await writePrimaryUrl(effects, url, { allowWriteAfterConst: true })
  }
})

const primaryUrlTask = primaryUrl.setupTask('critical', {
  reason: i18n('Primary URL removed. Select a new primary URL.'),
})

export const taskPrimaryUrl = sdk.setupOnInit(async (effects, kind) => {
  // an empty list means the addresses aren't known yet, not that the URL is gone
  if ((await getNonLocalUrls(effects)).length) {
    await primaryUrlTask.init(effects, kind)
  }
})
