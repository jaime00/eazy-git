import { log, select } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import handleUserCancellation from '#utils/handleUserCancellation.js'

export async function commitWithHooks(commitMsg) {
  let committed = false
  while (!committed) {
    const result = spawnSync('git', ['commit', '-m', commitMsg], {
      stdio: 'inherit'
    })

    if (result.status === 0) {
      log.success(t('commitSuccess'))
      committed = true
    } else {
      const hookChoice = await select({
        message: ui.secondary(t('hookBlocked')),
        options: [
          { value: 'retry', label: t('retryHook') },
          { value: 'noverify', label: t('skipHook') },
          { value: 'cancel', label: t('cancel') }
        ]
      })
      handleUserCancellation(hookChoice)

      if (hookChoice === 'cancel') return false
      if (hookChoice === 'noverify') {
        spawnSync('git', ['commit', '--no-verify', '-m', commitMsg], {
          stdio: 'inherit'
        })
        log.success(t('commitNoHooks'))
        committed = true
      }
      if (hookChoice === 'retry') {
        spawnSync('git', ['add', '-u'], { stdio: 'inherit' })
      }
    }
  }
  return true
}
