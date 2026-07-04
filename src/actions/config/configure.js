import { select, text, log, note } from "@clack/prompts";
import { getConfig, saveConfig } from "#config/index.js";
import { t, getAvailableLanguages } from "#i18n/index.js";
import { ui } from "#ui/theme.js";
import handleUserCancellation from "#utils/handleUserCancellation.js";

export default async function configure() {
  const action = await select({
    message: ui.secondary(t("configMenu")),
    options: [
      { value: "language", label: t("configLanguage") },
      { value: "defaultBranch", label: t("configDefaultBranch") },
      { value: "aiProvider", label: t("configAIProvider") },
      { value: "view", label: t("configView") },
    ],
  });
  handleUserCancellation(action);

  if (action === "language") {
    const lang = await select({
      message: ui.secondary(t("languageSelect")),
      options: getAvailableLanguages(),
      initialValue: getConfig().language,
    });
    handleUserCancellation(lang);
    saveConfig({ language: lang });
    log.success(t("languageChanged", lang));
    return configure();
  }

  if (action === "defaultBranch") {
    const branch = await text({
      message: ui.secondary(t("baseBranch")),
      initialValue: getConfig().defaultBaseBranch,
      validate: (v) => (!v?.trim() ? t("baseBranchRequired") : undefined),
    });
    handleUserCancellation(branch);
    saveConfig({ defaultBaseBranch: branch });
    log.success(t("defaultBranchSet", branch));
    return configure();
  }

  if (action === "aiProvider") {
    const provider = await select({
      message: ui.secondary(t("aiProvider")),
      options: [
        { value: "claude", label: "Claude" },
        { value: "opencode", label: "Opencode" },
      ],
      initialValue: getConfig().aiProvider,
    });
    handleUserCancellation(provider);
    saveConfig({ aiProvider: provider });
    log.success(t("aiProviderSet", provider));
    return configure();
  }

  if (action === "view") {
    const config = getConfig();
    const sensitivePattern = /key|token|secret/i;
    const lines = Object.entries(config)
      .map(([key, value]) => {
        const display = sensitivePattern.test(key) && typeof value === "string" && value.length > 4
          ? `****${value.slice(-4)}`
          : value;
        return `  ${key}: ${display}`;
      })
      .join("\n");
    note(lines, ui.secondary(t("currentConfig")));

    const back = await select({
      message: ui.secondary(""),
      options: [{ value: "back", label: ui.muted(t("goBack")) }],
    });
    handleUserCancellation(back);

    return configure();
  }
}
