export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Standard Notes Server': 0,
  'Server API': 1,
  'The Standard Notes Server is ready': 2,
  'The Standard Notes Server is not responding': 3,

  // interfaces.ts
  'The Standard Notes sync API. Point your Standard Notes app at this address to sync your encrypted notes.': 4,

  // actions/configure.ts
  Configure: 5,
  'Configure the files server URL': 6,
  'Files Server URL': 7,
  'Public URL clients use to reach the files server (the address you point your Standard Notes app at). Required only if you upload files. Leave blank to disable.': 8,
  'Configuration saved': 9,
  'The service is restarting with the new settings.': 10,
  'Premium Activation Mode': 11,
  'Temporarily exposes an unauthenticated endpoint to grant a Standard Notes subscription to a self-hosted account. Enable it only while activating premium, then turn it back off. While enabled it also forces legacy (non-cookie) sessions.': 12,
  'Leaves an unauthenticated premium-activation endpoint exposed and forces legacy sessions. Turn this off once activation is complete.': 13,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
