# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

```bash
npm run build          # esbuild bundles to dist/ (index.js, git.js, run.js, install.js)
npm link               # Link globally for local development testing
eg                     # Run the interactive CLI (after linking)
```

No test framework is configured. No linter is configured.

## Architecture

eazy-git is a globally-installed npm CLI tool for Git branch management. It uses ESM (`"type": "module"`) and esbuild to bundle four entry points into `dist/`.

### Entry Points

- **`index.js`** → `dist/index.js` — Main interactive menu (`eg`, `eazy-git`). Options: Add Changes to Branch, Create Original Branch, Create Temporal Branch, Configure.
- **`git.js`** → `dist/git.js` — Quick git commands (`pull`, `push`, `removelast`, `mergewith`, `commit`, `back`, `checkout`, `log`). Routes via `process.argv[1]` filename matching. `commit` without args launches an interactive flow (file selection, AI suggestion, hook handling); with args it does a quick `git add . && git commit`.
- **`run.js`** → `dist/run.js` — npm script runners (`run`, `runrun`).
- **`install.js`** → `dist/install.js` — npm registry config (`i`).

### Core Systems

- **i18n** (`src/i18n/`): `t(key, ...args)` for all user-facing strings. Locale files `es.js`/`en.js` export flat objects where values can be strings or functions for interpolation.
- **Config** (`src/config/index.js`): `getConfig()`/`saveConfig()` persist to `~/.eazy-git/config.json`. Keys: `language`, `defaultBaseBranch`, `aiProvider`.
- **Theme** (`src/ui/theme.js`): `ui.primary()`, `ui.secondary()`, `ui.muted()`, `ui.success()`, `ui.error()`, `ui.warning()` — chalk hex wrappers.

### Directory Structure

- `src/actions/` — Command implementations (git/, install/, config/, run/)
- `src/getters/` — Data retrieval functions (current branch, environment, package version)
- `src/utils/` — Shared utilities (handleUserCancellation, hasGitInstalled, isEmpty, gitFiles, selectFiles, aiCommitSuggestion, commitWithHooks)

### Import Aliases

The project uses Node.js subpath imports (`#` prefix) configured in `package.json` `imports` field and esbuild `alias` in `build.js`. IDE support via `jsconfig.json`.

| Alias        | Path            |
| ------------ | --------------- |
| `#actions/*` | `src/actions/*` |
| `#config/*`  | `src/config/*`  |
| `#getters/*` | `src/getters/*` |
| `#i18n/*`    | `src/i18n/*`    |
| `#ui/*`      | `src/ui/*`      |
| `#utils/*`   | `src/utils/*`   |

Use aliases for cross-directory imports. Keep relative imports (`./`) only for files within the same directory.

### Shared Commit Flow (`src/utils/`)

Both `commit.js` and `addChangesToBranch.js` share the interactive commit flow via reusable utils:

- **`gitFiles.js`** — `extractFilename()`, `getChangedFiles()`, `getStatusLabels()` for parsing `git status --short` output
- **`selectFiles.js`** — `selectAndStageFiles()` — multiselect file picker with "select all" option and staging confirmation loop. Returns `true` if files were staged, `false` if no files available.
- **`aiCommitSuggestion.js`** — `getAICommitMessage({ diff, commitPrefix })` — AI provider selection, prompt generation, suggestion display, and use/modify flow. Returns the final commit message string.
- **`commitWithHooks.js`** — `commitWithHooks(commitMsg)` — commit execution with retry/skip-hooks/cancel loop. Returns `true` if committed, `false` if cancelled.

## Conventions

- All user-facing strings must use `t()` from `src/i18n/index.js` — add keys to both `es.js` and `en.js`
- All prompts use `ui.secondary()` for the question color
- Git commands use `spawnSync` with array args (never string concatenation to avoid shell injection)
- Errors use `log.error()` from `@clack/prompts`, never `console.error`
- User cancellation must be handled with `handleUserCancellation()` from `src/utils/` — call it immediately after every `select`, `text`, `multiselect`, `confirm` prompt
- Entry-point async flows should be wrapped in try/catch with `log.error(err.message)` and `process.exit(1)`
- Config view must mask sensitive values (keys containing "key", "token", "secret") showing only last 4 chars
- Dependencies: `@clack/prompts` (interactive UI), `chalk` (colors)

## Commits

- NEVER include references to Claude, Claude Code, AI models, or "Co-authored-by" from any model/AI in commit messages, trailers, or metadata.
- Commits must appear as if written entirely by the human user.
