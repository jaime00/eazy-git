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
import handleUserCancellation from "../../utils/handleUserCancellation.js";
import { t, getCommitTypes } from "../../i18n/index.js";
import { ui } from "../../ui/theme.js";
import { getConfig } from "../../config/index.js";

function extractFilename(statusLine) {
  const raw = statusLine.slice(3).trim();
  return raw.includes(" -> ") ? raw.split(" -> ")[1].trim() : raw;
}

function getChangedFiles() {
  const output = execSync("git status --short", { encoding: "utf-8" }).trim();
  return output ? output.split("\n") : [];
}

const addChangesToBranch = async () => {
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
    const proceed = await confirm({
      message: t("noChangesPending"),
    });
    handleUserCancellation(proceed);
    if (!proceed) return;
  }

  const s = spinner();
  s.start(t("updatingRefs"));
  try {
    execSync("git fetch --quiet");
    s.stop(t("refsUpdated"));
  } catch {
    s.stop(t("fetchFailed"));
  }

  // --- Step 1: Branch configuration ---
  const originBranch = await text({
    message: ui.secondary(t("baseBranch")),
    placeholder: config.defaultBaseBranch,
    initialValue: config.defaultBaseBranch,
    validate: (v) => (!v?.trim() ? t("baseBranchRequired") : undefined),
  });
  handleUserCancellation(originBranch);

  const ticketReference = await text({
    message: ui.secondary(t("ticketId")),
    placeholder: "DPW-0000",
    validate: (v) => (!v?.trim() ? t("ticketRequired") : undefined),
  });
  handleUserCancellation(ticketReference);

  const ticketType = await select({
    message: ui.secondary(t("changeType")),
    options: COMMIT_TYPES,
  });
  handleUserCancellation(ticketType);

  // --- Step 2: Create branch ---
  const branchName = `${ticketType}/${ticketReference}`;
  const branchExists = spawnSync("git", ["branch", "--list", branchName], {
    encoding: "utf-8",
  }).stdout.trim();

  if (branchExists) {
    const choice = await select({
      message: ui.secondary(t("branchExistsLocal", branchName)),
      options: [
        { value: "checkout", label: t("switchToIt") },
        { value: "cancel", label: t("cancel") },
      ],
    });
    handleUserCancellation(choice);
    if (choice === "cancel") {
      log.warn(t("cancelledOp"));
      return;
    }
    spawnSync("git", ["checkout", branchName], { stdio: "inherit" });
  } else {
    try {
      s.start(t("creatingBranch", branchName, originBranch));
      spawnSync(
        "git",
        ["checkout", "-b", branchName, `origin/${originBranch}`],
        {
          stdio: "pipe",
        },
      );
      s.stop(t("branchCreated", branchName));
    } catch (err) {
      s.stop("");
      log.error(t("errorCreatingBranch", err.message));
      return;
    }
  }

  // --- Step 3: File selection ---
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
      spawnSync("git", ["add", filename], { encoding: "utf-8" });
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

  const prompt = `Analiza el siguiente git diff y sugiere UN SOLO mensaje de commit en formato convencional.

Formato requerido: ${ticketType}(${ticketReference}): descripcion en ingles
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
      initialValue: `${ticketType}(${ticketReference}): `,
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

  // --- Step 5: Commit (using spawnSync for safety) ---
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

  // --- Step 6: Optional push ---
  const doPush = await confirm({
    message: t("pushToRemote"),
  });
  handleUserCancellation(doPush);

  let prLink = "";
  if (doPush) {
    const executePush = (force = false) => {
      const pushArgs = force
        ? ["push", "-f", "origin", branchName]
        : ["push", "-u", "origin", branchName];
      spawnSync("git", pushArgs, { stdio: "inherit" });
    };

    const buildPrLink = () => {
      const remoteUrl = execSync("git remote get-url origin", {
        encoding: "utf-8",
      }).trim();
      const match = remoteUrl.match(/[:/]([^/]+\/[^/]+?)(\.git)?$/);
      const repoPath = match ? match[1] : "";
      if (remoteUrl.includes("github.com"))
        return `https://github.com/${repoPath}/compare/${branchName}?expand=1`;
      if (remoteUrl.includes("bitbucket.org"))
        return `https://bitbucket.org/${repoPath}/pull-requests/new?source=${branchName}`;
      if (remoteUrl.includes("gitlab.com"))
        return `https://gitlab.com/${repoPath}/-/merge_requests/new?merge_request[source_branch]=${branchName}`;
      return "";
    };

    const pushResult = spawnSync("git", ["push", "-u", "origin", branchName], {
      stdio: "inherit",
    });

    if (pushResult.status === 0) {
      log.success(t("pushSuccess"));
      prLink = buildPrLink();
    } else {
      const forceIt = await confirm({
        message: t("pushForceQuestion"),
      });
      handleUserCancellation(forceIt);
      if (forceIt) {
        const forceResult = spawnSync(
          "git",
          ["push", "-f", "origin", branchName],
          { stdio: "inherit" },
        );
        if (forceResult.status === 0) {
          log.success(t("pushForceSuccess"));
          prLink = buildPrLink();
        } else {
          log.error(t("pushForceError", "push failed"));
        }
      }
    }
  }

  // --- Final summary ---
  const committedCount = execSync(
    'git diff --name-only HEAD~1 HEAD 2>/dev/null || git show --name-only --format="" HEAD',
    { encoding: "utf-8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean).length;

  const summaryLines = [
    `${t("summaryBranch")}:   ${branchName}`,
    `${t("summaryFrom")}:    origin/${originBranch}`,
    `${t("summaryCommit")}:  ${commitMsg}`,
    `${t("summaryFiles", committedCount)}`,
    ...(doPush && prLink
      ? [
          `${t("summaryPush")}:    origin/${branchName}`,
          `${t("summaryPR")}:  ${prLink}`,
        ]
      : []),
  ];

  note(summaryLines.join("\n"), t("summaryTitle"));
};

export default addChangesToBranch;
