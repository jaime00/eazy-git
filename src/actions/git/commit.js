import { text, select, log } from "@clack/prompts";
import { execSync, spawnSync } from "child_process";
import handleUserCancellation from "#utils/handleUserCancellation.js";
import { getChangedFiles } from "#utils/gitFiles.js";
import { selectAndStageFiles } from "#utils/selectFiles.js";
import { getAICommitMessage } from "#utils/aiCommitSuggestion.js";
import { commitWithHooks } from "#utils/commitWithHooks.js";
import { t, getCommitTypes } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

function quickCommit(args) {
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

async function interactiveCommit() {
  const commitTypes = getCommitTypes();

  const COMMIT_TYPES = Object.entries(commitTypes).map(([value, label]) => ({
    value,
    label,
  }));

  // --- Step 0: Initial context ---
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
  }).trim();
  const files = getChangedFiles();

  log.info(`${t("currentBranch")}: ${currentBranch}`);
  log.info(`${t("filesChanged")}: ${files.length}`);

  if (files.length === 0) {
    log.warn(t("noFilesToStage"));
    return;
  }

  // --- Step 1: Ticket ID (optional) ---
  const ticketReference = await text({
    message: ui.secondary(t("ticketId")),
    placeholder: "DPW-0000",
  });
  handleUserCancellation(ticketReference);

  const hasTicket = ticketReference?.trim();

  // --- Step 2: Change type ---
  const ticketType = await select({
    message: ui.secondary(t("changeType")),
    options: COMMIT_TYPES,
  });
  handleUserCancellation(ticketType);

  // --- Step 3: File selection ---
  const staged = await selectAndStageFiles();
  if (!staged) return;

  // --- Step 4: AI commit suggestion ---
  const diff = execSync("git diff --cached", { encoding: "utf-8" });

  const commitPrefix = hasTicket
    ? `${ticketType}(${ticketReference.trim()}): `
    : `${ticketType}: `;

  const commitMsg = await getAICommitMessage({ diff, commitPrefix });

  // --- Step 5: Commit with hook handling ---
  await commitWithHooks(commitMsg);
}

export default async function commit(args) {
  try {
    if (args.length > 0) {
      quickCommit(args);
    } else {
      await interactiveCommit();
    }
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }
}
