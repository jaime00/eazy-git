import { log, spinner } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

function isDeltaInstalled() {
  const result = spawnSync('delta', ['--version'], { stdio: 'pipe' })
  return result.status === 0
}

function installDelta() {
  const s = spinner()
  s.start(t('deltaInstalling'))

  const brew = spawnSync('brew', ['install', 'git-delta'], {
    stdio: 'pipe'
  })

  if (brew.status !== 0) {
    s.stop(t('deltaInstallError'))
    return false
  }

  s.stop(t('deltaInstalled'))
  return true
}

function configureDelta() {
  const configs = [
    ['core.pager', 'delta'],
    ['interactive.diffFilter', 'delta --color-only'],
    ['delta.navigate', 'true'],
    ['delta.side-by-side', 'true'],
    ['merge.conflictstyle', 'diff3'],
    ['diff.colorMoved', 'default']
  ]

  for (const [key, value] of configs) {
    spawnSync('git', ['config', '--global', key, value], { stdio: 'pipe' })
  }
}

function removeDeltaConfig() {
  const configs = [
    'core.pager',
    'interactive.diffFilter',
    'delta.navigate',
    'delta.side-by-side'
  ]

  for (const key of configs) {
    spawnSync('git', ['config', '--global', '--unset', key], { stdio: 'pipe' })
  }
}

export function enableDelta() {
  if (!isDeltaInstalled()) {
    const installed = installDelta()
    if (!installed) return false
  }

  configureDelta()
  log.success(t('deltaConfigured'))
  return true
}

export function disableDelta() {
  removeDeltaConfig()
  log.success(t('deltaRemoved'))
  return true
}
