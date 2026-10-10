import { sdk } from '../sdk'
import { addSession } from './addSession'
import { removeSessions } from './removeSessions'
import { primaryUrl } from './setPrimaryUrl'
import { configureBasicAuth } from './configureBasicAuth'
import { resetBasicAuthPassword } from './resetBasicAuthPassword'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSessions)
  .addAction(primaryUrl.action)
  .addAction(configureBasicAuth)
  .addAction(resetBasicAuthPassword)
