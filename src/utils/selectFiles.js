import { multiselect, confirm, log, note } from "@clack/prompts";
import { execSync, spawnSync } from "child_process";
import handleUserCancellation from "#utils/handleUserCancellation.js";
import { extractFilename, getChangedFiles, getStatusLabels } from "#utils/gitFiles.js";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

export async function selectAndStageFiles() {
  const STATUS_LABELS = getStatusLabels();
  let stageConfirmed = false;

  while (!stageConfirmed) {
    const currentFiles = getChangedFiles();
    if (currentFiles.length === 0) {
      log.warn(t("noFilesToStage"));
      return false;
    }

    const SELECT_ALL = "__select_all__";
    const fileOptions = currentFiles.map((line) => {
      const status = line.slice(0, 2).trim();
      const filename = extractFilename(line);
      const statusLabel = STATUS_LABELS[status] ?? status;
      return { value: line, label: filename, hint: statusLabel };
    });

    const selectedLines = await multiselect({
      message: ui.secondary(t("selectFiles")),
      options: [
        { value: SELECT_ALL, label: ui.primary(t("selectAllFiles")) },
        ...fileOptions,
      ],
      required: true,
    });
    handleUserCancellation(selectedLines);

    const finalSelection = selectedLines.includes(SELECT_ALL)
      ? currentFiles
      : selectedLines;

    spawnSync("git", ["restore", "--staged", "."], { encoding: "utf-8" });

    for (const line of finalSelection) {
      const filename = extractFilename(line);
      const addResult = spawnSync("git", ["add", "--", filename], {
        encoding: "utf-8",
      });
      if (addResult.status !== 0) {
        log.error(`git add failed for ${filename}: ${addResult.stderr}`);
      }
    }

    const stagedStatus = execSync("git status --short", {
      encoding: "utf-8",
    }).trim();
    note(stagedStatus, t("stagedFiles"));

    const ok = await confirm({
      message: t("stagedCorrect"),
    });
    handleUserCancellation(ok);
    stageConfirmed = ok;

    if (!stageConfirmed) {
      spawnSync("git", ["restore", "--staged", "."], { encoding: "utf-8" });
    }
  }

  return true;
}
