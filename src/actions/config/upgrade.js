import { spawnSync } from "child_process";
import { spinner, log } from "@clack/prompts";
import getCurrentPackageVersion from "#getters/git/getCurrentPackageVersion.js";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

export default async function upgrade() {
  const currentVersion = getCurrentPackageVersion();
  log.info(`${t("currentVersionLabel")}: ${ui.muted(currentVersion)}`);

  const s = spinner();
  s.start(t("checkingUpdates"));

  const latest = spawnSync("npm", ["view", "eazy-git", "version"], {
    encoding: "utf-8",
  });

  const latestVersion = latest.stdout?.trim();

  if (latest.status !== 0 || !latestVersion) {
    s.stop(t("upgradeCheckFailed"));
    return;
  }

  if (currentVersion === latestVersion) {
    s.stop(t("alreadyLatest", latestVersion));
    return;
  }

  s.message(t("upgrading", latestVersion));

  const result = spawnSync("npm", ["install", "-g", "eazy-git@latest"], {
    encoding: "utf-8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    s.stop(t("upgradeError"));
    log.error(result.stderr?.trim() || t("unexpectedError"));
    return;
  }

  s.stop(t("upgradeSuccess", latestVersion));
}
