import { log } from "@clack/prompts";
import { spawnSync } from "child_process";
import { t } from "#i18n/index.js";

export default function mergeWith(args) {
  const branchName = args[0] ?? "develop";

  log.step(t("fetchingLatest"));
  spawnSync("git", ["fetch"], { stdio: "inherit" });

  log.step(t("mergingWith", branchName));
  const mergeResult = spawnSync("git", ["merge", `origin/${branchName}`], {
    stdio: "inherit",
  });

  if (mergeResult.status !== 0) {
    log.error(t("mergeError", "merge failed"));
    return;
  }

  log.step(t("pushingMerged"));
  const pushResult = spawnSync("git", ["push", "origin", "HEAD"], {
    stdio: "inherit",
  });

  if (pushResult.status === 0) {
    log.success(t("mergeCompleted"));
  } else {
    log.error(t("mergeError", "push failed"));
  }
}
