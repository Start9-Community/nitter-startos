import { IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { nitterConf } from '../fileModels/nitter.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// store.json as 2026.8.24:2 and earlier wrote it
const legacyStore = z.looseObject({
  basicAuth: z
    .looseObject({
      enabled: z.boolean().catch(false),
      password: z.string().nullable().catch(null),
    })
    .optional()
    .catch(undefined),
})

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.8.24:3',
  releaseNotes: {
    en_US: `Initial release. Nitter needs session cookies from an X account before it can start; Add X Account Session takes them, and Manage Access makes Nitter private, behind a username and password, or public.`,
    es_ES: `Versión inicial. Nitter necesita cookies de sesión de una cuenta de X antes de poder iniciarse; «Añadir sesión de cuenta de X» las recibe, y «Gestionar acceso» hace que Nitter sea privado, protegido con un nombre de usuario y una contraseña, o público.`,
    de_DE: `Erste Version. Nitter benötigt Sitzungs-Cookies eines X-Kontos, bevor es starten kann; „X-Konto-Sitzung hinzufügen“ nimmt sie entgegen, und „Zugriff verwalten“ macht Nitter privat, geschützt durch Benutzername und Passwort, oder öffentlich.`,
    pl_PL: `Pierwsze wydanie. Nitter potrzebuje ciasteczek sesji konta X, zanim będzie mógł się uruchomić; „Dodaj sesję konta X” je przyjmuje, a „Zarządzaj dostępem” ustawia Nitter jako prywatny, chroniony nazwą użytkownika i hasłem, albo publiczny.`,
    fr_FR: `Version initiale. Nitter a besoin des cookies de session d'un compte X avant de pouvoir démarrer ; « Ajouter une session de compte X » les reçoit, et « Gérer l'accès » rend Nitter privé, protégé par un nom d'utilisateur et un mot de passe, ou public.`,
  },
  migrations: {
    up: async ({ effects }) => {
      const { basicAuth } = legacyStore.parse(
        (await storeJson.read().once()) ?? {},
      )
      const server = await nitterConf.read((c) => c.Server).once()
      // Tor keeps an .onion on a retired port as unused; reattachTorOnions moves it to uiPort.
      const retired = await sdk.MultiHost.of(effects, 'ui-multi').retirePort(80)
      await storeJson.write(effects, {
        access: basicAuth?.enabled && basicAuth.password ? 'private' : 'public',
        password: basicAuth?.password ?? undefined,
        primaryUrl: server?.hostname
          ? `${server.https ? 'https' : 'http'}://${server.hostname}`
          : undefined,
        reattachTorOnions: retired,
      })
      await sdk.action.clearTask(effects, 'nitter:configure-basic-auth')
    },
    down: IMPOSSIBLE,
  },
})
