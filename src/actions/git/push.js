import { log } from "@clack/prompts";
import { spawnSync } from "child_process";
import { t } from "#i18n/index.js";

export default function push(args) {
  const isForce =
    args.includes("-f") || args.includes("--force") || args.includes("-force");

  log.step(t("pushingChanges"));
  const pushArgs = isForce
    ? ["push", "-f", "origin", "HEAD"]
    : ["push", "origin", "HEAD"];
  const result = spawnSync("git", pushArgs, { stdio: "inherit" });

  if (result.status === 0) {
    log.success(isForce ? t("pushedForceSuccess") : t("pushedSuccess"));
  } else {
    log.error(t("pushQuickError", "push failed"));
  }
}
