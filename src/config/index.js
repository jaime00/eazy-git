import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'
import path from 'path'

const CONFIG_DIR = path.join(os.homedir(), '.eazy-git')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

const DEFAULT_CONFIG = {
  language: 'es',
  defaultBaseBranch: 'release',
  aiProvider: 'claude',
  reuseLastCommit: false
}

export function getConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = readFileSync(CONFIG_FILE, 'utf-8')
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
    }
  } catch {
    // corrupted config, return defaults
  }
  return { ...DEFAULT_CONFIG }
}

export function saveConfig(updates) {
  const current = getConfig()
  const merged = { ...current, ...updates }
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2))
  return merged
}
