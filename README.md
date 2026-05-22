# 📦 eazy-git

`eazy-git` is a CLI tool that simplifies branch management in Git. It automates common workflows and maintains a consistent branch structure.

[![npm version](https://img.shields.io/npm/v/eazy-git.svg)](https://www.npmjs.com/package/eazy-git)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/jaime00/eazy-git.svg)](https://github.com/jaime00/eazy-git/stargazers)

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

- **Add Changes to Branch** — Stage files, generate a commit (with optional AI-suggested messages), and push
- **Create Original Branch** — Create a new branch from a base branch following naming conventions
- **Create Temporal Branch** — Create and merge a temporary branch into develop or release
- **Configure** — Change language, default base branch, or AI provider

---

## 🧰 Available Commands

| Command           | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| `eazy-git`, `eg`  | Launch the interactive CLI to create and manage Git branches                           |
| `pull`            | Pull latest changes from remote repository (`git pull origin HEAD`)                    |
| `push`            | Push local changes to remote repository (`git push origin HEAD`)                       |
| `removelast`      | Undo last commit while preserving changes in working directory (asks for confirmation) |
| `mergewith`       | Merge current branch with another remote branch (defaults to `origin/develop`)         |
| `commit`          | Stage all changes and commit with a provided message                                   |
| `back`            | Switch back to the previously checked out branch                                       |
| `checkout`        | Switch to a specified branch or return to the previous branch                          |
| `log`             | Display formatted commit history with details                                          |
| `run`             | Start development server (`npm run dev`)                                               |
| `runrun`          | Clean development server restart (removes `.next` folder and runs `npm run dev`)       |
| `i`               | Install project dependencies using configured auth token                               |
| `eg config`       | Open configuration menu (language, default branch, AI provider)                        |
| `-v`, `--version` | Display installed package version                                                      |

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

When using the "Add Changes to Branch" flow, eazy-git can generate commit message suggestions using AI. Supported providers:

- **Claude**
- **Opencode**

Configure your preferred provider via `eg config`.

---

## 📁 Project Structure

```
eazy-git/
├── src/
│   ├── actions/
│   │   ├── config/
│   │   │   └── configure.js
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
│       ├── handleUserCancellation.js
│       ├── hasGitInstalled.js
│       ├── isEmpty.js
│       └── validateTicketOfJIRA.js
│
├── build.js
├── git.js
├── index.js
├── install.js
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

- 🌐 **Portfolio**: [Visit my website](https://jaime00portfolio.netlify.app/)
- 💼 **LinkedIn**: [linkedin.com/in/jaime00](https://www.linkedin.com/in/jaime00)
- 📧 **Email**: [imjaimetorresv@gmail.com](mailto:imjaimetorresv@gmail.com)
- 🐙 **GitHub**: [github.com/jaime00](https://github.com/jaime00)

For contributions, bug reports, or suggestions, please open an [issue](https://github.com/jaime00/eazy-git/issues) in the repository.

---
