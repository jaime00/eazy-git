import { log } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

export default function diff(args = []) {
  const result = spawnSync('git', ['diff', ...args], { stdio: 'inherit' })

  if (result.status !== 0) {
    log.error(t('diffError', 'git diff failed'))
    process.exit(1)
  }
}
