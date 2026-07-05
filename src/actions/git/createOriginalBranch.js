import { log, spinner } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { getConfig } from '#config/index.js'

import { t } from '#i18n/index.js'

import createBranchName from './createBranchName.js'

const createOriginalBranch = async () => {
  const config = getConfig()
  const branchName = await createBranchName()
  const s = spinner()
  try {
    s.start(t('creatingOriginalBranch'))
    spawnSync(
      'git',
      ['checkout', '-b', branchName, `origin/${config.defaultBaseBranch}`],
      {
        stdio: 'inherit'
      }
    )
    spawnSync('git', ['push', 'origin', branchName], { stdio: 'inherit' })
    s.stop(t('branchCreatedAndPushed', branchName))
    log.success(t('branchCreatedSuccess', branchName))
  } catch (error) {
    s.stop('')
    log.error(t('errorCreatingBranch', error.message))
  }
}

export default createOriginalBranch
