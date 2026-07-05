import { execSync } from 'child_process'

import { t } from '#i18n/index.js'

export function extractFilename(statusLine) {
  const match = statusLine.match(/^[MADRCU? ]{2}\s+(.+)$/)
  const raw = match ? match[1] : statusLine.replace(/^[MADRCU? ]+\s+/, '')
  return raw.includes(' -> ') ? raw.split(' -> ')[1].trim() : raw.trim()
}

export function getChangedFiles() {
  const output = execSync('git status --short', { encoding: 'utf-8' }).trim()
  return output ? output.split('\n') : []
}

export function getStatusLabels() {
  return {
    M: t('statusModified'),
    A: t('statusAdded'),
    D: t('statusDeleted'),
    R: t('statusRenamed'),
    '??': t('statusUntracked')
  }
}
