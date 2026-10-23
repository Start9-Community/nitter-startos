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
    en_US: `- Manage Access makes Nitter private, behind a username and password, or public, and replaces Configure Basic Auth and Reset Basic Auth Password. A new install asks you to choose, with Private as the default; an existing install keeps its current access and password.
- When the address chosen as the primary URL goes away, Nitter keeps running and its links use another of your addresses until it returns. Open UI opens Nitter at its primary URL.
- The Web UI's addresses on your network may change port. A Tor address keeps its .onion and moves over as soon as a version of Tor that allows it is installed.`,
    es_ES: `- Gestionar acceso hace que Nitter sea privado, protegido con un nombre de usuario y una contraseña, o público, y sustituye a Configurar Basic Auth y Restablecer contraseña de Basic Auth. Una instalación nueva te pide elegir, con Privado como opción predeterminada; una instalación existente conserva su acceso y su contraseña actuales.
- Cuando la dirección elegida como URL principal deja de estar disponible, Nitter sigue funcionando y sus enlaces usan otra de tus direcciones hasta que vuelva. «Abrir UI» abre Nitter en su URL principal.
- Las direcciones de la interfaz web en tu red pueden cambiar de puerto. Una dirección Tor conserva su .onion y se traslada en cuanto se instala una versión de Tor que lo permita.`,
    de_DE: `- „Zugriff verwalten“ macht Nitter privat, geschützt durch Benutzername und Passwort, oder öffentlich und ersetzt „Basic Auth konfigurieren“ und „Basic-Auth-Passwort zurücksetzen“. Eine neue Installation fragt dich nach deiner Wahl, mit „Privat“ als Voreinstellung; eine bestehende Installation behält ihren aktuellen Zugriff und ihr Passwort.
- Fällt die als primäre URL gewählte Adresse weg, läuft Nitter weiter, und seine Links verwenden eine andere deiner Adressen, bis sie zurückkehrt. „UI öffnen“ öffnet Nitter unter seiner primären URL.
- Die Adressen der Weboberfläche in deinem Netzwerk können einen anderen Port bekommen. Eine Tor-Adresse behält ihre .onion-Adresse und zieht um, sobald eine Tor-Version installiert ist, die das erlaubt.`,
    pl_PL: `- „Zarządzaj dostępem” ustawia Nitter jako prywatny, chroniony nazwą użytkownika i hasłem, albo publiczny, i zastępuje akcje „Skonfiguruj Basic Auth” i „Zresetuj hasło Basic Auth”. Nowa instalacja prosi o wybór, domyślnie „Prywatny”; istniejąca instalacja zachowuje obecny dostęp i hasło.
- Gdy adres wybrany jako główny URL zniknie, Nitter działa dalej, a jego linki używają innego z twoich adresów, dopóki ten nie wróci. „Otwórz UI” otwiera Nitter pod jego głównym URL.
- Adresy interfejsu webowego w twojej sieci mogą zmienić port. Adres Tor zachowuje swój adres .onion i zostaje przeniesiony, gdy tylko zostanie zainstalowana wersja Tora, która na to pozwala.`,
    fr_FR: `- « Gérer l'accès » rend Nitter privé, protégé par un nom d'utilisateur et un mot de passe, ou public, et remplace « Configurer Basic Auth » et « Réinitialiser le mot de passe Basic Auth ». Une nouvelle installation vous demande de choisir, avec « Privé » par défaut ; une installation existante conserve son accès et son mot de passe actuels.
- Lorsque l'adresse choisie comme URL principale disparaît, Nitter continue de fonctionner et ses liens utilisent une autre de vos adresses jusqu'à son retour. « Ouvrir UI » ouvre Nitter sur son URL principale.
- Les adresses de l'interface web sur votre réseau peuvent changer de port. Une adresse Tor conserve son .onion et est déplacée dès qu'une version de Tor qui le permet est installée.`,
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
