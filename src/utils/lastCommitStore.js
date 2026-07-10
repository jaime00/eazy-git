import { spawnSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import os from 'os'
import path from 'path'

const CONFIG_DIR = path.join(os.homedir(), '.eazy-git')
const COMMITS_FILE = path.join(CONFIG_DIR, 'commits.json')

function getRepoName() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf-8'
  })
  if (result.status !== 0) return null
  return path.basename(result.stdout.trim())
}

export function saveLastCommit(msg) {
  const repoName = getRepoName()
  if (!repoName) return

  let commits = {}
  try {
    if (existsSync(COMMITS_FILE)) {
      commits = JSON.parse(readFileSync(COMMITS_FILE, 'utf-8'))
    }
  } catch {
    // corrupted, start fresh
  }

  commits[repoName] = msg

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
  writeFileSync(COMMITS_FILE, JSON.stringify(commits, null, 2))
}

export function getLastCommit() {
  const repoName = getRepoName()
  if (!repoName) return null

  try {
    if (existsSync(COMMITS_FILE)) {
      const commits = JSON.parse(readFileSync(COMMITS_FILE, 'utf-8'))
      return commits[repoName] ?? null
    }
  } catch {
    // corrupted
  }
  return null
}
