import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  filesServerUrl: Value.text({
    name: i18n('Files Server URL'),
    description: i18n(
      'Public URL clients use to reach the files server (the address you point your Standard Notes app at). Required only if you upload files. Leave blank to disable.',
    ),
    required: false,
    default: null,
  }),
  premiumActivationMode: Value.toggle({
    name: i18n('Premium Activation Mode'),
    description: i18n(
      'Temporarily exposes an unauthenticated endpoint to grant a Standard Notes subscription to a self-hosted account. Enable it only while activating premium, then turn it back off. While enabled it also forces legacy (non-cookie) sessions.',
    ),
    warning: i18n(
      'Leaves an unauthenticated premium-activation endpoint exposed and forces legacy sessions. Turn this off once activation is complete.',
    ),
    default: false,
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  async ({ effects }) => ({
    name: i18n('Configure'),
    description: i18n('Configure the files server URL'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const s = await storeJson.read().once()
    return {
      filesServerUrl: s?.filesServerUrl || null,
      premiumActivationMode: s?.premiumActivationMode ?? false,
    }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      filesServerUrl: input.filesServerUrl ?? '',
      premiumActivationMode: input.premiumActivationMode,
    })
    await effects.restart()
    return {
      version: '1' as const,
      title: i18n('Configuration saved'),
      message: i18n('The service is restarting with the new settings.'),
      result: null,
    }
  },
)
