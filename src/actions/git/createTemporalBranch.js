import getCurrentBranch from '#getters/git/getCurrentBranch.js'
import getEnvironment from '#getters/git/getEnvironment.js'
import { confirm, log } from '@clack/prompts'
import { spawnSync } from 'child_process'

import { t } from '#i18n/index.js'

import handleUserCancellation from '#utils/handleUserCancellation.js'

const createTemporalBranch = async () => {
  try {
    const environment = await getEnvironment()
    const branchName = getCurrentBranch()
    const tempBranchName = `${branchName}-${environment}`

    spawnSync(
      'git',
      ['checkout', '-b', tempBranchName, `origin/${environment}`],
      {
        stdio: 'inherit'
      }
    )
    log.success(t('temporalBranchCreated'))

    spawnSync('git', ['merge', `origin/${branchName}`], { stdio: 'inherit' })
    log.success(t('temporalBranchMerged'))

    const statusResult = spawnSync('git', ['status', '--porcelain'], {
      encoding: 'utf-8'
    })
    if (statusResult.stdout.includes('UU')) {
      log.warn(t('conflictsDetected'))
      return
    }

    spawnSync('git', ['push', 'origin', tempBranchName], { stdio: 'inherit' })
    log.info(t('branchPushedToRemote'))

    const hasToRemoveTemporalBranch = await confirm({
      message: t('removeTemporalBranch')
    })
    handleUserCancellation(hasToRemoveTemporalBranch)

    if (hasToRemoveTemporalBranch) {
      spawnSync('git', ['checkout', branchName], { stdio: 'inherit' })
      spawnSync('git', ['branch', '-D', tempBranchName], { stdio: 'inherit' })
      log.info(t('temporalBranchDeleted'))
    }
  } catch (error) {
    log.error(`${t('errorCreatingTemporal')}: ${error.message}`)
  }
}

export default createTemporalBranch
