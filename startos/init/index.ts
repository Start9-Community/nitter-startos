import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { taskSessions } from './taskSessions'
import { syncPrimaryUrl, taskPrimaryUrl } from './taskPrimaryUrl'
import { taskBasicAuth } from './taskBasicAuth'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  taskSessions,
  syncPrimaryUrl,
  taskPrimaryUrl,
  taskBasicAuth,
)

export const uninit = sdk.setupUninit(versionGraph)
