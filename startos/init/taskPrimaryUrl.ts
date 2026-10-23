import { primaryUrl } from '../actions/setPrimaryUrl'
import { nitterConf } from '../fileModels/nitter.conf'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskPrimaryUrl = primaryUrl.setupTask('important', {
  reason: i18n(
    'Choose which of your Nitter URLs is used for generating links, such as RSS feed and canonical URLs.',
  ),
})

export const syncPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const url = await primaryUrl.bestUsable(effects).const()
  if (!url) return
  const { protocol, host } = new URL(url)
  await nitterConf.merge(effects, {
    Server: { hostname: host, https: protocol === 'https:' },
  })
})
