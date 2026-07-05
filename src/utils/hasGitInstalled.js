import { log } from '@clack/prompts'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

import { t } from '#i18n/index.js'

const ensureGitRepo = () => {
  try {
    execSync('git --version', { stdio: 'ignore' })
  } catch {
    log.error(t('gitNotInstalled'))
    process.exit(1)
  }

  const gitDir = join(process.cwd(), '.git')
  if (!existsSync(gitDir)) {
    log.error(t('notGitRepo'))
    process.exit(1)
  }
}

export default ensureGitRepo
