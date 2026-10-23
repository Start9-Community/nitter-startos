import { setupOnionReattachment } from 'tor-startos/startos/utils/reattach'
import { storeJson } from '../fileModels/store.json'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { uiPort } from '../utils'

export const reattachTorOnions = setupOnionReattachment(sdk, {
  packageId: manifest.id,
  hostId: 'ui-multi',
  to: { interfaceId: 'ui', internalPort: uiPort, ssl: false },
  pending: storeJson.read((s) => s.reattachTorOnions),
  clear: (effects) =>
    storeJson.merge(
      effects,
      { reattachTorOnions: false },
      { allowWriteAfterConst: true },
    ),
})
