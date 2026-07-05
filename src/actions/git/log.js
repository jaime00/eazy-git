import { log } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

export default function consolelog(args = []) {
  const result = spawnSync('git', ['log', ...args], { stdio: 'inherit' })

  if (result.status !== 0) {
    log.error(t('logError', 'git log failed'))
    process.exit(1)
  }
}
