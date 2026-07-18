import { log, select, text } from '@clack/prompts'
import { execSync, spawnSync } from 'child_process'

import { getConfig } from '#config/index.js'

import { getCommitTypes, t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import { getAICommitMessage } from '#utils/aiCommitSuggestion.js'
import { commitWithHooks } from '#utils/commitWithHooks.js'
import { getChangedFiles } from '#utils/gitFiles.js'
import handleUserCancellation from '#utils/handleUserCancellation.js'
import { getLastCommit, saveLastCommit } from '#utils/lastCommitStore.js'
import { selectAndStageFiles } from '#utils/selectFiles.js'

function quickCommit(args) {
  const commitMsg = args[0]
  if (!commitMsg) {
    log.error(t('provideCommitMsg'))
    process.exit(1)
  }

  log.step(t('stagingChanges'))
  spawnSync('git', ['add', '.'], { stdio: 'inherit' })
  log.step(t('creatingCommit'))
  const result = spawnSync('git', ['commit', '-m', commitMsg], {
    stdio: 'inherit'
  })

  if (result.status === 0) {
    log.success(t('commitCreated'))
  } else {
    log.error(t('commitError', 'commit failed'))
  }
}

async function interactiveCommit() {
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
    log.warn(t('noFilesToStage'))
    return
  }

  // --- Step 1: Check last commit suggestion ---
  if (config.reuseLastCommit) {
    const lastCommit = getLastCommit()
    if (lastCommit) {
      log.info(t('lastCommitFound', lastCommit))

      const action = await select({
        message: ui.secondary(t('lastCommitAction')),
        options: [
          { value: 'reuse', label: t('reuseCommit') },
          { value: 'modify', label: t('modifyCommit') },
          { value: 'new', label: t('newCommit') }
        ]
      })
      handleUserCancellation(action)

      if (action === 'reuse') {
        const staged = await selectAndStageFiles()
        if (!staged) return
        const committed = await commitWithHooks(lastCommit)
        if (committed) saveLastCommit(lastCommit)
        return
      }

      if (action === 'modify') {
        const staged = await selectAndStageFiles()
        if (!staged) return
        const modified = await text({
          message: ui.secondary(t('writeCommitMsg')),
          initialValue: lastCommit,
          validate: (v) => (!v?.trim() ? t('commitMsgRequired') : undefined)
        })
        handleUserCancellation(modified)
        const committed = await commitWithHooks(modified)
        if (committed) saveLastCommit(modified)
        return
      }

      // action === 'new': fall through to normal flow
    }
  }

  // --- Step 2: Ticket ID (optional) ---
  const ticketReference = await text({
    message: ui.secondary(t('ticketId')),
    placeholder: '---------'
  })
  handleUserCancellation(ticketReference)

  const hasTicket =
    ticketReference?.trim() && ticketReference?.trim() !== '---------'

  // --- Step 3: Change type ---
  const ticketType = await select({
    message: ui.secondary(t('changeType')),
    options: COMMIT_TYPES
  })
  handleUserCancellation(ticketType)

  // --- Step 4: File selection ---
  const staged = await selectAndStageFiles()
  if (!staged) return

  // --- Step 5: AI commit suggestion ---
  const diff = execSync('git diff --cached', {
    encoding: 'utf-8',
    maxBuffer: Infinity
  })

  const commitPrefix = hasTicket
    ? `${ticketType}(${ticketReference.trim()}): `
    : `${ticketType}: `

  const commitMsg = await getAICommitMessage({ diff, commitPrefix })

  // --- Step 6: Commit with hook handling ---
  const committed = await commitWithHooks(commitMsg)
  if (committed) saveLastCommit(commitMsg)
}

export default async function commit(args) {
  try {
    if (args.length > 0) {
      quickCommit(args)
    } else {
      await interactiveCommit()
    }
  } catch (err) {
    log.error(err.message)
    process.exit(1)
  }
}
