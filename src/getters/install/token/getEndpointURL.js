import { text } from '@clack/prompts'

import { t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import handleUserCancellation from '#utils/handleUserCancellation.js'

const getEndpointURL = async () => {
  const domain = await text({
    message: ui.secondary(t('enterEndpoint')),
    placeholder: '',
    initialValue: '',
    required: true,
    validate(value) {
      if (!value?.trim()) return t('urlRequired')
      try {
        const url = new URL(value)
        if (!url.protocol.startsWith('http')) return t('urlMustBeHttp')
        if (!url.hostname) return t('urlMustHaveHost')
        return undefined
      } catch {
        return t('urlInvalid')
      }
    }
  })
  handleUserCancellation(domain)
  return domain
}

export default getEndpointURL
