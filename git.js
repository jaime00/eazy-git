import { log } from '@clack/prompts'

import { t } from '#i18n/index.js'

import hasGitInstalled from '#utils/hasGitInstalled.js'

import add from '#actions/git/add.js'
import checkout from '#actions/git/checkout.js'
import commit from '#actions/git/commit.js'
import diff from '#actions/git/diff.js'
import consolelog from '#actions/git/log.js'
import mergewith from '#actions/git/mergewith.js'
import pull from '#actions/git/pull.js'
import push from '#actions/git/push.js'
import removelast from '#actions/git/removelast.js'

hasGitInstalled()

const gitCommand = process.argv[1].split('/').pop()
const args = process.argv.slice(2)

const commands = {
  add: () => add(args),
  pull,
  push: () => push(args),
  removelast,
  mergewith: () => mergewith(args),
  commit: () => commit(args),
  checkout: () => checkout(args),
  back: () => checkout('-'),
  log: () => consolelog(args),
  diff: () => diff(args)
}

async function main() {
  try {
    const command = commands[gitCommand]
    if (!command) {
      log.error(`${t('unknownCommand')}: ${gitCommand}`)
      process.exit(1)
    }

    await command()
    process.exit(0)
  } catch (error) {
    log.error(`${t('errorExecuting')}: ${error.message}`)
    process.exit(1)
  }
}

main()
