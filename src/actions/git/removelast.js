import { log, note } from "@clack/prompts";
import { execSync, spawnSync } from "child_process";
import { t } from "#i18n/index.js";

function formatCommitDate(isoDate) {
  const date = new Date(isoDate);

  const year = date.getFullYear();
  const month = date.toLocaleString("en", { month: "long" });
  const day = date.getDate();
  const weekday = date.toLocaleString("en", { weekday: "long" });

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const time = `${h12}:${minutes}:${seconds} ${ampm}`;

  const tz = Intl.DateTimeFormat(undefined, { timeZoneName: "long" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value ?? "";

  return `${year} de ${month} ${day} (${weekday}) | ${time} | ${tz}`;
}

export default function removelast() {
  // Capture commit info before reset
  const hash = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  const author = execSync('git log -1 --format="%an <%ae>"', {
    encoding: "utf-8",
  }).trim();
  const dateIso = execSync('git log -1 --format="%ai"', {
    encoding: "utf-8",
  }).trim();
  const subject = execSync('git log -1 --format="%s"', {
    encoding: "utf-8",
  }).trim();

  log.step(t("removingLastCommit"));
  const result = spawnSync("git", ["reset", "--soft", "HEAD~1"], {
    stdio: "inherit",
  });

  if (result.status === 0) {
    log.success(t("lastCommitRemoved", hash));

    const detail = [
      `Author: ${author}`,
      `Date:   ${formatCommitDate(dateIso)}`,
      "",
      `    ${subject}`,
    ].join("\n");

    note(detail, t("removedCommitDetail"));
  } else {
    log.error(t("removeLastError", "reset failed"));
  }
}
