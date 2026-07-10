import { log } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

export default function checkout(args) {
  const isNew = args[0] === '-b'
  const branch = isNew ? args[1] : args[0] || '-'
  const isPreviousBranch = !isNew && branch === '-'

  if (isPreviousBranch) {
    log.step(t('switchingPrevBranch'))
  }

  const gitArgs = isNew ? ['checkout', '-b', branch] : ['checkout', branch]
  const result = spawnSync('git', gitArgs, { stdio: 'inherit' })

  if (result.status === 0) {
    log.success(t('switchedTo', isPreviousBranch ? 'previous' : branch))
  } else {
    log.error(t('checkoutError', 'checkout failed'))
    process.exit(1)
  }
}
