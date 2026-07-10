# 📦 eazy-git

`eazy-git` is a CLI tool that simplifies branch management in Git. It automates common workflows and maintains a consistent branch structure.

[![npm version](https://img.shields.io/npm/v/eazy-git.svg)](https://www.npmjs.com/package/eazy-git)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/jaime00/eazy-git.svg)](https://github.com/jaime00/eazy-git/stargazers)

---

## 📋 Requirements

- **Node.js** v18 or higher
- **Git** installed and available in your `PATH`

---

## 🚀 Installation

Install it globally with npm:

```bash
npm install -g eazy-git
```

Or clone it and link it locally for development:

```bash
git clone https://github.com/jaime00/eazy-git.git
cd eazy-git
npm install
npm link
```

---

## ⚙️ Usage

Run the main command from the root of your Git repository:

```bash
eazy-git
```

or

```bash
eg
```

This opens an interactive menu with the following options:

- **Add Changes to Branch** — Stage files, generate a commit (with optional AI-suggested messages), and push. JIRA ticket is optional — if omitted, the branch is named after the commit type only (e.g., `fix`)
- **Create Original Branch** — Create a new branch from a base branch following naming conventions
- **Create Temporal Branch** — Create and merge a temporary branch into develop or release
- **Configure** — Change language, default base branch, AI provider, reuse last commit setting, or view current configuration

---

## 🧰 Available Commands

| Command           | Description                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `eazy-git`, `eg`  | Launch the interactive CLI to create and manage Git branches                               |
| `pull`            | Pull latest changes from remote repository (`git pull origin HEAD`)                        |
| `push`            | Push local changes to remote repository (`git push origin HEAD`)                           |
| `removelast`      | Undo last commit while preserving changes in working directory (shows commit details)      |
| `mergewith`       | Merge current branch with another remote branch (defaults to `origin/develop`)             |
| `commit`          | Stage and commit: interactive flow (no args) or quick commit with a message                |
| `back`            | Switch back to the previously checked out branch                                           |
| `checkout`        | Switch to a branch or create a new one with `-b <name>`                                    |
| `log`             | Display formatted commit history (passes args to `git log`, e.g. `log -p` / `log --patch`) |
| `build`           | Build the project (`npm run build` or `pnpm run build` — auto-detected)                    |
| `run`             | Start development server (`npm run dev` or `pnpm run dev` — auto-detected)                 |
| `runrun`          | Clean development server restart (removes `.next` folder and runs dev — auto-detected)     |
| `i`               | Configure npm registry authentication (AWS CodeArtifact) and generate `.npmrc`             |
| `eg config`       | Open configuration menu (language, default branch, AI provider)                            |
| `eg upgrade`      | Upgrade eazy-git to the latest version from npm                                            |
| `-v`, `--version` | Display installed package version                                                          |

---

## 🌐 Internationalization (i18n)

eazy-git supports multiple languages. Currently available:

- 🇺🇸 English (`en`)
- 🇪🇸 Spanish (`es`)

Change the language via the configuration menu:

```bash
eg config
```

---

## 🤖 AI Commit Suggestions

When using the "Add Changes to Branch" flow or running `commit` without arguments, eazy-git can generate commit message suggestions using AI. Supported providers:

- **Claude**
- **Opencode**

Configure your preferred provider via `eg config`.

> **Note:** Both providers are invoked as local CLI binaries (`claude` and `opencode`). They must be installed and available in your `PATH` — no API key configuration within eazy-git is required.

---

## 🔁 Last Commit Reuse

When `reuseLastCommit` is enabled in your config, running `commit` interactively will detect your previous commit message and offer three options:

- **Reuse** — apply the same message to the new commit
- **Modify** — edit the previous message before committing
- **New** — start a fresh commit flow

Enable it via `eg config`.

---

## 📁 Project Structure

```
eazy-git/
├── src/
│   ├── actions/
│   │   ├── config/
│   │   │   ├── configure.js
│   │   │   └── upgrade.js
│   │   ├── git/
│   │   │   ├── addChangesToBranch.js
│   │   │   ├── checkout.js
│   │   │   ├── commit.js
│   │   │   ├── createBranchName.js
│   │   │   ├── createOriginalBranch.js
│   │   │   ├── createTemporalBranch.js
│   │   │   ├── log.js
│   │   │   ├── mergewith.js
│   │   │   ├── pull.js
│   │   │   ├── push.js
│   │   │   └── removelast.js
│   │   ├── install/
│   │   │   ├── addNewConfig.js
│   │   │   ├── dropCurrentConfig.js
│   │   │   ├── generateNpmrc.js
│   │   │   ├── getCurrentConfig.js
│   │   │   └── showCurrentConfig.js
│   │   └── run/
│   │       └── commands.js
│   ├── config/
│   │   └── index.js
│   ├── getters/
│   │   ├── git/
│   │   │   ├── getBranchType.js
│   │   │   ├── getCurrentBranch.js
│   │   │   ├── getCurrentPackageVersion.js
│   │   │   ├── getEnvironment.js
│   │   │   └── getTicketOfJIRA.js
│   │   └── install/
│   │       ├── config/
│   │       │   └── getLastConfig.js
│   │       ├── npm/
│   │       │   ├── getRegistryName.js
│   │       │   └── getRegistryURL.js
│   │       └── token/
│   │           ├── getApiKey.js
│   │           └── getEndpointURL.js
│   ├── i18n/
│   │   ├── en.js
│   │   ├── es.js
│   │   └── index.js
│   ├── ui/
│   │   └── theme.js
│   └── utils/
│       ├── aiCommitSuggestion.js
│       ├── commitWithHooks.js
│       ├── gitFiles.js
│       ├── handleUserCancellation.js
│       ├── hasGitInstalled.js
│       ├── isEmpty.js
│       ├── lastCommitStore.js
│       ├── selectFiles.js
│       └── validateTicketOfJIRA.js
│
├── build.js
├── git.js
├── index.js
├── install.js
├── jsconfig.json
├── run.js
├── package.json
└── README.md
```

---

## 🛠️ Contribute

Contributions welcome! To get started:

```bash
git clone https://github.com/jaime00/eazy-git.git
cd eazy-git
npm install
npm link
eazy-git # or use the abbreviated version with eg
```

Please open an [issue](https://github.com/jaime00/eazy-git/issues) to report bugs or suggest improvements.

---

## 📝 License

Distributed under the MIT [License](LICENSE).

---

## 📬 Contact

- 🌐 **Portfolio**: [Visit my website](https://jaimetorresv.com)
- 💼 **LinkedIn**: [linkedin.com/in/jaimetorresv](https://www.linkedin.com/in/jaimetorresv/)
- 📧 **Email**: [imjaimetorresv@gmail.com](mailto:imjaimetorresv@gmail.com)
- 🐙 **GitHub**: [github.com/jaime00](https://github.com/jaime00)

For contributions, bug reports, or suggestions, please open an [issue](https://github.com/jaime00/eazy-git/issues) in the repository.

---
