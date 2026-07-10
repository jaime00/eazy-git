import { log } from '@clack/prompts'

import { t } from '#i18n/index.js'

import { build, run, runrun } from '#actions/run/commands.js'

const command = process.argv[1].split('/').pop()

const commands = {
  build,
  run,
  runrun
}

async function main() {
  try {
    const commandToExecute = commands[command]
    if (!commandToExecute) {
      log.error(`${t('unknownCommand')}: ${command}`)
      process.exit(1)
    }

    await commandToExecute()
    process.exit(0)
  } catch (error) {
    log.error(`${t('errorExecuting')}: ${error.message}`)
    process.exit(1)
  }
}

main()
