import { log, note, select, spinner, text } from '@clack/prompts'
import { spawn } from 'child_process'

import { getConfig } from '#config/index.js'

import { t } from '#i18n/index.js'

import { ui } from '#ui/theme.js'

import handleUserCancellation from '#utils/handleUserCancellation.js'

export async function getAICommitMessage({ diff, commitPrefix }) {
  const config = getConfig()

  const prompt = `Analiza el siguiente git diff y sugiere UN SOLO mensaje de commit en formato convencional.

Formato requerido: ${commitPrefix}description in english
Reglas:
- Maximo 72 caracteres en total
- Verbo en presente ("add", "fix", "update", NO "added", "fixed")
- Sin punto final
- En ingles
- Responde UNICAMENTE con el mensaje de commit, sin explicaciones, sin comillas, sin markdown

Git diff:
${diff}`

  const aiChoice = await select({
    message: ui.secondary(t('aiProvider')),
    options: [
      { value: 'claude', label: 'Claude' },
      { value: 'opencode', label: 'Opencode' }
    ],
    initialValue: config.aiProvider
  })
  handleUserCancellation(aiChoice)

  const aiConfig = {
    claude: { binary: 'claude', args: ['-p', '-'], label: 'Claude' },
    opencode: { binary: 'opencode', args: ['run', '-'], label: 'Opencode' }
  }

  const { binary, args, label } = aiConfig[aiChoice]

  const s = spinner()
  s.start(t('generatingCommit', label))
  const aiResult = await new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    const proc = spawn(binary, args, {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    proc.stdin.write(prompt)
    proc.stdin.end()
    proc.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    proc.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    proc.on('close', (code) =>
      resolve({ status: code, stdout, stderr, error: null })
    )
    proc.on('error', (err) =>
      resolve({ status: 1, stdout: '', stderr: '', error: err })
    )
  })
  s.stop('')

  if (aiResult.error || aiResult.status !== 0) {
    log.warn(t('aiSuggestionFailed', label))
    const customMsg = await text({
      message: ui.secondary(t('writeCommitMsg')),
      initialValue: commitPrefix,
      validate: (v) => (!v?.trim() ? t('commitMsgRequired') : undefined)
    })
    handleUserCancellation(customMsg)
    return customMsg
  }

  const suggestion = aiResult.stdout.trim()
  note(suggestion, t('suggestionOf', label))

  const useIt = await select({
    message: ui.secondary(t('useThisCommit')),
    options: [
      { value: 'yes', label: t('yesUseIt') },
      { value: 'modify', label: t('modify') }
    ]
  })
  handleUserCancellation(useIt)

  if (useIt === 'yes') {
    return suggestion
  }

  const customMsg = await text({
    message: ui.secondary(t('writeCommitMsg')),
    initialValue: suggestion,
    validate: (v) => (!v?.trim() ? t('commitMsgRequired') : undefined)
  })
  handleUserCancellation(customMsg)
  return customMsg
}
