import { confirm, log, note, select, spinner, text } from '@clack/prompts'
import { execSync, spawnSync } from 'child_process'

import { getConfig } from '#config/index.js'

import { getCommitTypes, t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import { getAICommitMessage } from '#utils/aiCommitSuggestion.js'
import { commitWithHooks } from '#utils/commitWithHooks.js'
import { getChangedFiles } from '#utils/gitFiles.js'
import handleUserCancellation from '#utils/handleUserCancellation.js'
import { selectAndStageFiles } from '#utils/selectFiles.js'

const addChangesToBranch = async () => {
  try {
    const config = getConfig()
    const commitTypes = getCommitTypes()

    const COMMIT_TYPES = Object.entries(commitTypes).map(([value, label]) => ({
      value,
      label
    }))

    // --- Step 0: Initial context ---
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8'
    }).trim()
    const files = getChangedFiles()

    log.info(`${t('currentBranch')}: ${currentBranch}`)
    log.info(`${t('filesChanged')}: ${files.length}`)

    if (files.length === 0) {
      const proceed = await confirm({
        message: t('noChangesPending')
      })
      handleUserCancellation(proceed)
      if (!proceed) return
    }

    const s = spinner()
    s.start(t('updatingRefs'))
    try {
      execSync('git fetch --quiet')
      s.stop(t('refsUpdated'))
    } catch {
      s.stop(t('fetchFailed'))
    }

    // --- Step 1: Branch configuration ---
    const originBranch = await text({
      message: ui.secondary(t('baseBranch')),
      placeholder: config.defaultBaseBranch,
      initialValue: config.defaultBaseBranch,
      validate: (v) => (!v?.trim() ? t('baseBranchRequired') : undefined)
    })
    handleUserCancellation(originBranch)

    const ticketReference = await text({
      message: ui.secondary(t('ticketId')),
      placeholder: '---------',
      validate: (v) => (!v?.trim() ? t('ticketRequired') : undefined)
    })
    handleUserCancellation(ticketReference)

    const ticketType = await select({
      message: ui.secondary(t('changeType')),
      options: COMMIT_TYPES
    })
    handleUserCancellation(ticketType)

    // --- Step 2: Create branch ---
    const branchName = `${ticketType}/${ticketReference}`
    const branchExists = spawnSync('git', ['branch', '--list', branchName], {
      encoding: 'utf-8'
    }).stdout.trim()

    if (branchExists) {
      const choice = await select({
        message: ui.secondary(t('branchExistsLocal', branchName)),
        options: [
          { value: 'checkout', label: t('switchToIt') },
          { value: 'cancel', label: t('cancel') }
        ]
      })
      handleUserCancellation(choice)
      if (choice === 'cancel') {
        log.warn(t('cancelledOp'))
        return
      }
      spawnSync('git', ['checkout', branchName], { stdio: 'inherit' })
    } else {
      try {
        s.start(t('creatingBranch', branchName, originBranch))
        spawnSync(
          'git',
          ['checkout', '-b', branchName, `origin/${originBranch}`],
          {
            stdio: 'pipe'
          }
        )
        s.stop(t('branchCreated', branchName))
      } catch (err) {
        s.stop('')
        log.error(t('errorCreatingBranch', err.message))
        return
      }
    }

    // --- Step 3: File selection ---
    const staged = await selectAndStageFiles()
    if (!staged) return

    // --- Step 4: AI commit suggestion ---
    const diff = execSync('git diff --cached', { encoding: 'utf-8' })

    const commitPrefix = `${ticketType}(${ticketReference}): `

    const commitMsg = await getAICommitMessage({ diff, commitPrefix })

    // --- Step 5: Commit with hook handling ---
    const committed = await commitWithHooks(commitMsg)
    if (!committed) return

    // --- Step 6: Optional push ---
    const doPush = await confirm({
      message: t('pushToRemote')
    })
    handleUserCancellation(doPush)

    let prLink = ''
    if (doPush) {
      const buildPrLink = () => {
        const remoteUrl = execSync('git remote get-url origin', {
          encoding: 'utf-8'
        }).trim()
        const match = remoteUrl.match(/[:/]([^/]+\/[^/]+?)(\.git)?$/)
        const repoPath = match ? match[1] : ''
        if (remoteUrl.includes('github.com'))
          return `https://github.com/${repoPath}/compare/${branchName}?expand=1`
        if (remoteUrl.includes('bitbucket.org'))
          return `https://bitbucket.org/${repoPath}/pull-requests/new?source=${branchName}`
        if (remoteUrl.includes('gitlab.com'))
          return `https://gitlab.com/${repoPath}/-/merge_requests/new?merge_request[source_branch]=${branchName}`
        return ''
      }

      const pushResult = spawnSync(
        'git',
        ['push', '-u', 'origin', branchName],
        {
          stdio: 'inherit'
        }
      )

      if (pushResult.status === 0) {
        log.success(t('pushSuccess'))
        prLink = buildPrLink()
      } else {
        const forceIt = await confirm({
          message: t('pushForceQuestion')
        })
        handleUserCancellation(forceIt)
        if (forceIt) {
          const forceResult = spawnSync(
            'git',
            ['push', '-f', 'origin', branchName],
            { stdio: 'inherit' }
          )
          if (forceResult.status === 0) {
            log.success(t('pushForceSuccess'))
            prLink = buildPrLink()
          } else {
            log.error(t('pushForceError', 'push failed'))
          }
        }
      }
    }

    // --- Final summary ---
    const committedCount = execSync(
      'git diff --name-only HEAD~1 HEAD 2>/dev/null || git show --name-only --format="" HEAD',
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean).length

    const summaryLines = [
      `${t('summaryBranch')}:   ${branchName}`,
      `${t('summaryFrom')}:    origin/${originBranch}`,
      `${t('summaryCommit')}:  ${commitMsg}`,
      `${t('summaryFiles', committedCount)}`,
      ...(doPush && prLink
        ? [
            `${t('summaryPush')}:    origin/${branchName}`,
            `${t('summaryPR')}:  ${prLink}`
          ]
        : [])
    ]

    note(summaryLines.join('\n'), t('summaryTitle'))
  } catch (err) {
    log.error(err.message)
    process.exit(1)
  }
}

export default addChangesToBranch
