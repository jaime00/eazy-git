import { log } from "@clack/prompts";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

export default function showCurrentConfig({
  endpoint,
  apikey,
  registryURL,
  registryName,
}) {
  const maskedKey =
    apikey.length > 8
      ? `${apikey.slice(0, 4)}${"*".repeat(apikey.length - 8)}${apikey.slice(-4)}`
      : "****";

  log.info(`${ui.secondary(t("currentConfig"))}
${ui.muted(`   endpoint:     ${endpoint}`)}
${ui.muted(`   apikey:       ${maskedKey}`)}
${ui.muted(`   registryURL:  ${registryURL}`)}
${ui.muted(`   registryName: ${registryName}`)}
`);
}
