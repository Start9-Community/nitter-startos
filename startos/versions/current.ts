import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.8.24:1',
  releaseNotes: {
    en_US:
      'When the address set as the primary URL moves to another port or between HTTP and HTTPS, RSS and other links follow it automatically.',
    es_ES:
      'Cuando la dirección elegida como URL principal cambia de puerto o pasa entre HTTP y HTTPS, los enlaces RSS y demás enlaces la siguen automáticamente.',
    de_DE:
      'Wechselt die als primäre URL gewählte Adresse den Port oder zwischen HTTP und HTTPS, folgen RSS- und andere Links ihr automatisch.',
    pl_PL:
      'Gdy adres ustawiony jako główny URL zmieni port lub przejdzie między HTTP a HTTPS, linki RSS i inne automatycznie za nim podążają.',
    fr_FR:
      "Lorsque l'adresse choisie comme URL principale change de port ou passe entre HTTP et HTTPS, les liens RSS et autres la suivent automatiquement.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
