import { log } from "@clack/prompts";

import pull from "./src/actions/git/pull.js";
import push from "./src/actions/git/push.js";
import removelast from "./src/actions/git/removelast.js";
import mergewith from "./src/actions/git/mergewith.js";
import commit from "./src/actions/git/commit.js";
import consolelog from "./src/actions/git/log.js";
import checkout from "./src/actions/git/checkout.js";

import hasGitInstalled from "./src/utils/hasGitInstalled.js";
import { t } from "./src/i18n/index.js";

hasGitInstalled();

const gitCommand = process.argv[1].split("/").pop();
const args = process.argv.slice(2);

const commands = {
  pull,
  push: () => push(args),
  removelast,
  mergewith: () => mergewith(args),
  commit: () => commit(args),
  checkout: () => checkout(args),
  back: () => checkout("-"),
  log: consolelog,
};

async function main() {
  try {
    const command = commands[gitCommand];
    if (!command) {
      log.error(`${t("unknownCommand")}: ${gitCommand}`);
      process.exit(1);
    }

    await command();
    process.exit(0);
  } catch (error) {
    log.error(`${t("errorExecuting")}: ${error.message}`);
    process.exit(1);
  }
}

main();
