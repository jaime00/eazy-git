import { log } from "@clack/prompts";
import { spawnSync } from "child_process";
import { t } from "../../i18n/index.js";

export default function commit(args) {
  const commitMsg = args[0];
  if (!commitMsg) {
    log.error(t("provideCommitMsg"));
    process.exit(1);
  }

  log.step(t("stagingChanges"));
  spawnSync("git", ["add", "."], { stdio: "inherit" });
  log.step(t("creatingCommit"));
  const result = spawnSync("git", ["commit", "-m", commitMsg], {
    stdio: "inherit",
  });

  if (result.status === 0) {
    log.success(t("commitCreated"));
  } else {
    log.error(t("commitError", "commit failed"));
  }
}
