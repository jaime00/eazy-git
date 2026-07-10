import { log } from '@clack/prompts'
import { execSync } from 'child_process'
import { existsSync } from 'fs'

function isPnpm() {
  return (
    existsSync('pnpm-lock.yaml') ||
    existsSync('pnpm-workspace.yaml') ||
    existsSync('.pnpmfile.cjs')
  )
}

export async function run() {
  try {
    const cmd = isPnpm() ? 'pnpm run dev' : 'npm run dev'
    execSync(cmd, { stdio: 'inherit' })
  } catch (error) {
    log.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export async function build() {
  try {
    const cmd = isPnpm() ? 'pnpm run build' : 'npm run build'
    execSync(cmd, { stdio: 'inherit' })
  } catch (error) {
    log.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export async function runrun() {
  try {
    const cmd = isPnpm() ? 'pnpm run dev' : 'npm run dev'
    execSync(`rm -rf .next && ${cmd}`, { stdio: 'inherit' })
  } catch (error) {
    log.error(`Error: ${error.message}`)
    process.exit(1)
  }
}
