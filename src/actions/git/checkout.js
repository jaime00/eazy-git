import { log } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

export default function checkout(args) {
  const branch = args[0] || '-'
  const isPreviousBranch = branch === '-'

  if (isPreviousBranch) {
    log.step(t('switchingPrevBranch'))
  }

  const result = spawnSync('git', ['checkout', branch], { stdio: 'inherit' })

  if (result.status === 0) {
    log.success(t('switchedTo', isPreviousBranch ? 'previous' : branch))
  } else {
    log.error(t('checkoutError', 'checkout failed'))
    process.exit(1)
  }
}
