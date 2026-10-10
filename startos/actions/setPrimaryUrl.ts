import { T } from '@start9labs/start-sdk'
import { nitterConf } from '../fileModels/nitter.conf'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const readPrimaryUrl = nitterConf.read(
  ({ Server }) =>
    Server.hostname &&
    `${Server.https ? 'https' : 'http'}://${Server.hostname}`,
)

export function writePrimaryUrl(
  effects: T.Effects,
  url: string,
  options?: { allowWriteAfterConst?: boolean },
) {
  const { host, protocol } = new URL(url)
  return nitterConf.merge(
    effects,
    { Server: { hostname: host, https: protocol === 'https:' } },
    options,
  )
}

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-primary-url',
  hostId: 'ui-multi',
  interfaceId: 'ui',
  metadata: {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose which of your Nitter URLs is used for generating links, such as RSS feed and canonical URLs.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: { name: i18n('URL'), description: null },
  get: readPrimaryUrl,
  set: writePrimaryUrl,
  fallback: false,
})
