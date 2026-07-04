import {
  text,
  select,
  multiselect,
  confirm,
  spinner,
  log,
  note,
} from "@clack/prompts";
import { execSync, spawnSync, spawn } from "child_process";
import handleUserCancellation from "#utils/handleUserCancellation.js";
import { t, getCommitTypes } from "#i18n/index.js";
import { ui } from "#ui/theme.js";
import { getConfig } from "#config/index.js";

function extractFilename(statusLine) {
  const match = statusLine.match(/^[MADRCU? ]{2}\s+(.+)$/);
  const raw = match ? match[1] : statusLine.replace(/^[MADRCU? ]+\s+/, "");
  return raw.includes(" -> ") ? raw.split(" -> ")[1].trim() : raw.trim();
}

function getChangedFiles() {
  const output = execSync("git status --short", { encoding: "utf-8" }).trim();
  return output ? output.split("\n") : [];
}

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
  const config = getConfig();
  const commitTypes = getCommitTypes();

  const COMMIT_TYPES = Object.entries(commitTypes).map(([value, label]) => ({
    value,
    label,
  }));

  const STATUS_LABELS = {
    M: t("statusModified"),
    A: t("statusAdded"),
    D: t("statusDeleted"),
    R: t("statusRenamed"),
    "??": t("statusUntracked"),
  };

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
  const s = spinner();
  let stageConfirmed = false;

  while (!stageConfirmed) {
    const currentFiles = getChangedFiles();
    if (currentFiles.length === 0) {
      log.warn(t("noFilesToStage"));
      return;
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

  // --- Step 4: AI commit suggestion ---
  const diff = execSync("git diff --cached", { encoding: "utf-8" });

  const commitFormat = hasTicket
    ? `${ticketType}(${ticketReference.trim()}): description in english`
    : `${ticketType}: description in english`;

  const prompt = `Analiza el siguiente git diff y sugiere UN SOLO mensaje de commit en formato convencional.

Formato requerido: ${commitFormat}
Reglas:
- Maximo 72 caracteres en total
- Verbo en presente ("add", "fix", "update", NO "added", "fixed")
- Sin punto final
- En ingles
- Responde UNICAMENTE con el mensaje de commit, sin explicaciones, sin comillas, sin markdown

Git diff:
${diff}`;

  const aiChoice = await select({
    message: ui.secondary(t("aiProvider")),
    options: [
      { value: "claude", label: "Claude" },
      { value: "opencode", label: "Opencode" },
    ],
    initialValue: config.aiProvider,
  });
  handleUserCancellation(aiChoice);

  const aiConfig = {
    claude: { binary: "claude", args: ["-p", prompt], label: "Claude" },
    opencode: { binary: "opencode", args: ["run", prompt], label: "Opencode" },
  };

  const { binary, args, label } = aiConfig[aiChoice];

  const commitPrefix = hasTicket
    ? `${ticketType}(${ticketReference.trim()}): `
    : `${ticketType}: `;

  s.start(t("generatingCommit", label));
  const aiResult = await new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn(binary, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    proc.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    proc.on("close", (code) =>
      resolve({ status: code, stdout, stderr, error: null }),
    );
    proc.on("error", (err) =>
      resolve({ status: 1, stdout: "", stderr: "", error: err }),
    );
  });
  s.stop("");

  let commitMsg;

  if (aiResult.error || aiResult.status !== 0) {
    log.warn(t("aiSuggestionFailed", label));
    const customMsg = await text({
      message: ui.secondary(t("writeCommitMsg")),
      initialValue: commitPrefix,
      validate: (v) => (!v?.trim() ? t("commitMsgRequired") : undefined),
    });
    handleUserCancellation(customMsg);
    commitMsg = customMsg;
  } else {
    const suggestion = aiResult.stdout.trim();
    note(suggestion, t("suggestionOf", label));

    const useIt = await select({
      message: ui.secondary(t("useThisCommit")),
      options: [
        { value: "yes", label: t("yesUseIt") },
        { value: "modify", label: t("modify") },
      ],
    });
    handleUserCancellation(useIt);

    if (useIt === "yes") {
      commitMsg = suggestion;
    } else {
      const customMsg = await text({
        message: ui.secondary(t("writeCommitMsg")),
        initialValue: suggestion,
        validate: (v) => (!v?.trim() ? t("commitMsgRequired") : undefined),
      });
      handleUserCancellation(customMsg);
      commitMsg = customMsg;
    }
  }

  // --- Step 5: Commit with hook handling ---
  let committed = false;
  while (!committed) {
    const result = spawnSync("git", ["commit", "-m", commitMsg], {
      stdio: "inherit",
    });

    if (result.status === 0) {
      log.success(t("commitSuccess"));
      committed = true;
    } else {
      const hookChoice = await select({
        message: ui.secondary(t("hookBlocked")),
        options: [
          { value: "retry", label: t("retryHook") },
          { value: "noverify", label: t("skipHook") },
          { value: "cancel", label: t("cancel") },
        ],
      });
      handleUserCancellation(hookChoice);

      if (hookChoice === "cancel") return;
      if (hookChoice === "noverify") {
        spawnSync("git", ["commit", "--no-verify", "-m", commitMsg], {
          stdio: "inherit",
        });
        log.success(t("commitNoHooks"));
        committed = true;
      }
      if (hookChoice === "retry") {
        spawnSync("git", ["add", "-u"], { stdio: "inherit" });
      }
    }
  }
}

export default async function commit(args) {
  if (args.length > 0) {
    quickCommit(args);
  } else {
    await interactiveCommit();
  }
}
