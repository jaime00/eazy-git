import { existsSync, writeFileSync } from "fs";
import { log, intro } from "@clack/prompts";
import os from "os";
import path from "path";

import getEndpointURL from "../../getters/install/token/getEndpointURL.js";
import getApiKey from "../../getters/install/token/getApiKey.js";
import getRegistryName from "../../getters/install/npm/getRegistryName.js";
import getRegistryURL from "../../getters/install/npm/getRegistryURL.js";
import isEmpty from "../../utils/isEmpty.js";
import { t } from "../../i18n/index.js";
import { ui } from "../../ui/theme.js";

const addNewConfig = async () => {
  intro(ui.primary(t("settingUpConfig")));
  const endpoint = await getEndpointURL();
  const apikey = await getApiKey();
  const registryName = await getRegistryName();
  const registryURL = await getRegistryURL();

  if (
    isEmpty(endpoint) ||
    isEmpty(apikey) ||
    isEmpty(registryName) ||
    isEmpty(registryURL)
  ) {
    log.error(t("missingConfigValues"));
    process.exit(1);
    return;
  }

  const config = { endpoint, apikey, registryName, registryURL };
  const configContent = `export default ${JSON.stringify(config, null, 2)}`;

  try {
    const configPath = path.join(os.homedir(), "config.js");
    writeFileSync(configPath, configContent);
    log.success(ui.primary(t("configSaved")));
  } catch (error) {
    log.error(`${t("errorWritingConfig")} ${error.message}`);
    process.exit(1);
  }
  return config;
};

export default addNewConfig;
