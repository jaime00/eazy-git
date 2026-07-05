import { confirm } from '@clack/prompts'

import { t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import handleUserCancellation from '#utils/handleUserCancellation.js'

const getLastConfig = async () => {
  const config = await confirm({
    message: ui.secondary(t('useThisConfig'))
  })
  handleUserCancellation(config)
  return config
}

export default getLastConfig
