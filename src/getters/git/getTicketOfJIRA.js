import { text } from '@clack/prompts'

import { t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import handleUserCancellation from '#utils/handleUserCancellation.js'
import validateTicketOfJIRA from '#utils/validateTicketOfJIRA.js'

const getTicketOfJIRA = async () => {
  const ticket = await text({
    message: ui.secondary(t('enterJiraCode')),
    initialValue: '',
    validate(value) {
      if (!value?.trim()) return t('jiraRequired')
      if (!validateTicketOfJIRA(value)) return t('jiraInvalidFormat')
    }
  })
  handleUserCancellation(ticket)
  return ticket
}

export default getTicketOfJIRA
