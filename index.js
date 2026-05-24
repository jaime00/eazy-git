import { select, intro, outro, cancel } from "@clack/prompts";

import createOriginalBranch from "#actions/git/createOriginalBranch.js";
import createTemporalBranch from "#actions/git/createTemporalBranch.js";
import addChangesToBranch from "#actions/git/addChangesToBranch.js";
import configure from "#actions/config/configure.js";
import getCurrentPackageVersion from "#getters/git/getCurrentPackageVersion.js";
import hasGitInstalled from "#utils/hasGitInstalled.js";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

const args = process.argv.slice(2);

if (args.includes("-v") || args.includes("--version")) {
  console.log(`${t("version")}: ${getCurrentPackageVersion()}`);
  process.exit(0);
}

if (args.includes("config") || args.includes("--config")) {
  await configure();
  process.exit(0);
}

hasGitInstalled();

intro(
  ui.primary(`
    ${t("welcome")}

    .-------------------------------------------------------------------------------.
    | ██████████  █████████  ████████████████ █████      █████████  ████████████████|
    |░░███░░░░░█ ███░░░░░███░█░░░░░░███░░███ ░░███      ███░░░░░███░░███░█░░░███░░░█|
    | ░███  █ ░ ░███    ░███░     ███░  ░░███ ███      ███     ░░░  ░███░   ░███  ░ |
    | ░██████   ░███████████     ███     ░░█████      ░███          ░███    ░███    |
    | ░███░░█   ░███░░░░░███    ███       ░░███       ░███    █████ ░███    ░███    |
    | ░███ ░   █░███    ░███  ████     █   ░███       ░░███  ░░███  ░███    ░███    |
    | ███████████████   ████████████████   █████       ░░█████████  █████   █████   |
    |░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░░░░   ░░░░░         ░░░░░░░░░  ░░░░░   ░░░░░    |
    '-------------------------------------------------------------------------------'

    ${ui.muted(t("subtitle"))}
  `),
);

const action = await select({
  message: ui.secondary(t("whatToDo")),
  options: [
    { value: "ACB", label: t("addChanges") },
    { value: "CRO", label: t("createOriginal") },
    { value: "CRT", label: t("createTemporal") },
    { value: "CFG", label: t("configMenu") },
  ],
  required: true,
  initialValue: "ACB",
});

if (action === "ACB") await addChangesToBranch();
else if (action === "CRO") await createOriginalBranch();
else if (action === "CRT") await createTemporalBranch();
else if (action === "CFG") await configure();
else {
  cancel(t("operationCancelled"));
  process.exit(0);
}

outro(ui.success(t("operationCompleted")));
