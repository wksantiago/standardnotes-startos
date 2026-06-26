import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'standardnotes-server',
  title: 'Standard Notes Server',
  license: 'AGPL-3.0-or-later',
  packageRepo: 'https://github.com/privkeyio/standardnotes-startos',
  upstreamRepo: 'https://github.com/standardnotes/server',
  marketingUrl: 'https://github.com/standardnotes/server',
  donationUrl: null,
  description: {
    short,
    long,
  },
  volumes: ['main'],
  images: {
    'standardnotes-server': {
      source: {
        dockerBuild: {},
      },
      arch: ['x86_64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
