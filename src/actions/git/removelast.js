import { log, confirm } from "@clack/prompts";
import { spawnSync } from "child_process";
import { t } from "#i18n/index.js";
import handleUserCancellation from "#utils/handleUserCancellation.js";

export default async function removelast() {
  const proceed = await confirm({
    message: t("removeLastConfirm"),
  });
  handleUserCancellation(proceed);

  if (!proceed) return;

  log.step(t("removingLastCommit"));
  const result = spawnSync("git", ["reset", "--soft", "HEAD~1"], {
    stdio: "inherit",
  });

  if (result.status === 0) {
    log.success(t("lastCommitRemoved"));
  } else {
    log.error(t("removeLastError", "reset failed"));
  }
}
