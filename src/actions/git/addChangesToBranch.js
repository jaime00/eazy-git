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

const COMMIT_TYPES = [
  { value: "fix", label: "fix — correccion de bug" },
  { value: "feat", label: "feat — nueva funcionalidad" },
  { value: "refactor", label: "refactor — mejora sin cambio funcional" },
  { value: "chore", label: "chore — mantenimiento, dependencias" },
  { value: "docs", label: "docs — documentacion" },
  { value: "test", label: "test — pruebas" },
  { value: "ci", label: "ci — integracion continua" },
  { value: "perf", label: "perf — rendimiento" },
  { value: "style", label: "style — formato, sin cambio de logica" },
];

function extractFilename(statusLine) {
  // git status --short format: "XY filename" (first 2 chars = status, then space)
  // For renames: "XY old -> new" — take the destination (after "->")
  const raw = statusLine.slice(3).trim();
  return raw.includes(" -> ") ? raw.split(" -> ")[1].trim() : raw;
}

function getChangedFiles() {
  const output = execSync("git status --short", { encoding: "utf-8" }).trim();
  return output ? output.split("\n") : [];
}

const addChangesToBranch = async () => {
  // --- Paso 0: Contexto inicial ---
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
  }).trim();
  const files = getChangedFiles();

  log.info(`Branch actual: ${currentBranch}`);
  log.info(`Archivos con cambios: ${files.length}`);

  if (files.length === 0) {
    const proceed = await confirm({
      message: "No hay cambios pendientes. Deseas continuar de todas formas?",
    });
    handleUserCancellation(proceed);
    if (!proceed) return;
  }

  const s = spinner();
  s.start("Actualizando referencias remotas...");
  try {
    execSync("git fetch --quiet");
    s.stop("Referencias actualizadas");
  } catch {
    s.stop("No se pudo hacer fetch (continuando...)");
  }

  // --- Paso 1: Configuracion de la rama ---
  const originBranch = await text({
    message: "Desde que branch base quieres crear la rama?",
    placeholder: "release",
    validate: (v) =>
      v.length === 0 ? "El branch base es requerido" : undefined,
  });
  handleUserCancellation(originBranch);

  const ticketReference = await text({
    message: "Cual es el identificador del ticket? (ej: DPW-0000)",
    placeholder: "DPW-0000",
    validate: (v) => (v.length === 0 ? "El ticket es requerido" : undefined),
  });
  handleUserCancellation(ticketReference);

  const ticketType = await select({
    message: "Que tipo de cambio es?",
    options: COMMIT_TYPES,
  });
  handleUserCancellation(ticketType);

  // --- Paso 2: Crear la rama ---
  const branchName = `${ticketType}/${ticketReference}`;
  const branchExists = execSync(`git branch --list ${branchName}`, {
    encoding: "utf-8",
  }).trim();

  if (branchExists) {
    const choice = await select({
      message: `La rama "${branchName}" ya existe localmente. Que deseas hacer?`,
      options: [
        { value: "checkout", label: "Cambiarme a ella y continuar" },
        { value: "cancel", label: "Cancelar" },
      ],
    });
    handleUserCancellation(choice);
    if (choice === "cancel") {
      log.warn("Operacion cancelada.");
      return;
    }
    execSync(`git checkout ${branchName}`, { stdio: "inherit" });
  } else {
    try {
      s.start(`Creando rama ${branchName} desde origin/${originBranch}...`);
      execSync(`git checkout -b ${branchName} origin/${originBranch}`);
      s.stop(`Rama ${branchName} creada`);
    } catch (err) {
      s.stop("");
      log.error(`Error al crear la rama: ${err.message}`);
      return;
    }
  }

  // --- Paso 3: Seleccion de archivos ---
  let stageConfirmed = false;

  while (!stageConfirmed) {
    const currentFiles = getChangedFiles();
    if (currentFiles.length === 0) {
      log.warn("No hay archivos para stagear.");
      return;
    }

    const STATUS_LABELS = {
      M: "modificado",
      A: "agregado",
      D: "eliminado",
      R: "renombrado",
      "??": "sin rastrear",
    };

    const selectedLines = await multiselect({
      message: "Cuales archivos quieres incluir en el commit?",
      options: currentFiles.map((line) => {
        const status = line.slice(0, 2).trim();
        const filename = extractFilename(line);
        const statusLabel = STATUS_LABELS[status] ?? status;
        return { value: line, label: filename, hint: statusLabel };
      }),
      required: true,
    });
    handleUserCancellation(selectedLines);

    spawnSync("git", ["restore", "--staged", "."], { encoding: "utf-8" });

    for (const line of selectedLines) {
      const filename = extractFilename(line);
      spawnSync("git", ["add", filename], { encoding: "utf-8" });
    }

    const stagedStatus = execSync("git status --short", {
      encoding: "utf-8",
    }).trim();
    note(stagedStatus, "Archivos en stage");

    const ok = await confirm({
      message: "Los archivos en stage son correctos?",
    });
    handleUserCancellation(ok);
    stageConfirmed = ok;

    if (!stageConfirmed) {
      spawnSync("git", ["restore", "--staged", "."], { encoding: "utf-8" });
    }
  }

  // --- Paso 4: Sugerir mensaje de commit con Claude ---
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

  s.start("Generando sugerencia de commit con Claude...");
  const claudeResult = await new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn("claude", ["-p", prompt], {
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

  if (claudeResult.error || claudeResult.status !== 0) {
    log.warn(
      "No se pudo obtener sugerencia de Claude. Escribe el mensaje manualmente.",
    );
    const customMsg = await text({
      message: "Escribe el mensaje de commit:",
      initialValue: `${ticketType}(${ticketReference}): `,
      validate: (v) =>
        v.trim().length === 0 ? "El mensaje es requerido" : undefined,
    });
    handleUserCancellation(customMsg);
    commitMsg = customMsg;
  } else {
    const suggestion = claudeResult.stdout.trim();
    note(suggestion, "Sugerencia de Claude");

    const useIt = await select({
      message: "Este mensaje de commit te parece bien?",
      options: [
        { value: "yes", label: "Si, usar este" },
        { value: "modify", label: "Modificar" },
      ],
    });
    handleUserCancellation(useIt);

    if (useIt === "yes") {
      commitMsg = suggestion;
    } else {
      const customMsg = await text({
        message: "Escribe el mensaje de commit:",
        initialValue: suggestion,
        validate: (v) =>
          v.trim().length === 0 ? "El mensaje es requerido" : undefined,
      });
      handleUserCancellation(customMsg);
      commitMsg = customMsg;
    }
  }

  // --- Paso 5: Commit ---
  const safeMsg = commitMsg.replace(/"/g, '\\"');
  let committed = false;
  while (!committed) {
    try {
      execSync(`git commit -m "${safeMsg}"`, { stdio: "inherit" });
      log.success("Commit realizado correctamente");
      committed = true;
    } catch {
      const hookChoice = await select({
        message: "El pre-commit hook bloqueo el commit. Que deseas hacer?",
        options: [
          {
            value: "retry",
            label: "Ya lo corregi, agrega los cambios y vuelve a intentarlo",
          },
          { value: "noverify", label: "Saltar el hook (--no-verify)" },
          { value: "cancel", label: "Cancelar" },
        ],
      });
      handleUserCancellation(hookChoice);

      if (hookChoice === "cancel") return;
      if (hookChoice === "noverify") {
        execSync(`git commit --no-verify -m "${safeMsg}"`, {
          stdio: "inherit",
        });
        log.success("Commit realizado (sin hooks)");
        committed = true;
      }
      // 'retry': el loop vuelve a intentar git commit tras re-stagear automaticamente
      if (hookChoice === "retry") {
        execSync("git add -u", { stdio: "inherit" });
      }
    }
  }

  // --- Paso 6: Push opcional ---
  const doPush = await confirm({
    message: "Deseas subir la rama al repositorio remoto?",
  });
  handleUserCancellation(doPush);

  let prLink = "";
  if (doPush) {
    const executePush = (force = false) => {
      const cmd = force
        ? `git push -f origin ${branchName}`
        : `git push -u origin ${branchName}`;
      execSync(cmd, { stdio: "inherit" });
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

    try {
      executePush();
      log.success("Push realizado");
      prLink = buildPrLink();
    } catch (err) {
      const isRejected =
        err.message.includes("rejected") ||
        err.message.includes("non-fast-forward");
      if (isRejected) {
        const forceIt = await confirm({
          message:
            "La rama ya existe en el remoto con historial diferente. Deseas forzar el push? (git push -f)",
        });
        handleUserCancellation(forceIt);
        if (forceIt) {
          try {
            executePush(true);
            log.success("Push forzado realizado");
            prLink = buildPrLink();
          } catch (forceErr) {
            log.error(`Error en el push forzado: ${forceErr.message}`);
          }
        }
      } else {
        log.error(`Error en el push: ${err.message}`);
      }
    }
  }

  // --- Resumen final ---
  const committedCount = execSync(
    'git diff --name-only HEAD~1 HEAD 2>/dev/null || git show --name-only --format="" HEAD',
    { encoding: "utf-8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean).length;

  const summaryLines = [
    `Rama:     ${branchName}`,
    `Desde:    origin/${originBranch}`,
    `Commit:   ${commitMsg}`,
    `Archivos: ${committedCount} archivos commiteados`,
    ...(doPush && prLink
      ? [`Push:     origin/${branchName}`, `Crear PR: ${prLink}`]
      : []),
  ];

  note(summaryLines.join("\n"), "Listo!");
};

export default addChangesToBranch;
