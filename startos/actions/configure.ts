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
    }
  },
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      filesServerUrl: input.filesServerUrl ?? '',
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
