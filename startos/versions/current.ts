import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.8.24:4',
  releaseNotes: {
    en_US: "Fixes Nitter's health checks using more memory the longer it runs.",
    es_ES:
      'Corrige que las comprobaciones de estado de Nitter usen más memoria cuanto más tiempo está en funcionamiento.',
    de_DE:
      'Behebt, dass die Statusprüfungen von Nitter umso mehr Speicher belegen, je länger es läuft.',
    pl_PL:
      'Naprawia kontrole stanu Nitter, które zużywały tym więcej pamięci, im dłużej działał.',
    fr_FR:
      "Corrige les vérifications d'état de Nitter qui utilisaient de plus en plus de mémoire à mesure qu'il fonctionnait.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
