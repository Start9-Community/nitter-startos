import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'nitter',
  title: 'Nitter',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9-Community/nitter-startos',
  upstreamRepo: 'https://github.com/zedeus/nitter',
  marketingUrl: 'https://github.com/zedeus/nitter',
  donationUrl: 'https://liberapay.com/zedeus',
  description: { short, long },
  volumes: ['main'],
  images: {
    nitter: {
      source: {
        dockerBuild: {
          buildArgs: {
            IMAGE: 'zedeus/nitter:8142bab1a920d13589ab5e689d7623ac0ac7ec34',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
    valkey: {
      source: { dockerTag: 'valkey/valkey:9-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
