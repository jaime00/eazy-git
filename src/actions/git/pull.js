import { log } from "@clack/prompts";
import { spawnSync } from "child_process";
import { t } from "../../i18n/index.js";

export default function pull() {
  log.step(t("fetchingRemote"));
  const fetchResult = spawnSync("git", ["fetch"], { stdio: "inherit" });

  if (fetchResult.status !== 0) {
    log.error(t("pullError", "fetch failed"));
    return;
  }

  log.step(t("pullingChanges"));
  const pullResult = spawnSync("git", ["pull", "origin", "HEAD"], {
    stdio: "inherit",
  });

  if (pullResult.status !== 0) {
    log.error(t("pullError", "pull failed"));
  }
}
