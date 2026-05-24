import { existsSync } from "fs";
import { log, cancel } from "@clack/prompts";
import os from "os";
import path from "path";

import getLastConfig from "#getters/install/config/getLastConfig.js";
import addnewConfig from "#actions/install/addNewConfig.js";
import generateNpmrc from "#actions/install/generateNpmrc.js";
import dropCurrentConfig from "#actions/install/dropCurrentConfig.js";
import getCurrentConfig from "#actions/install/getCurrentConfig.js";
import showCurrentConfig from "#actions/install/showCurrentConfig.js";
import { t } from "#i18n/index.js";

try {
  const configPath = path.join(os.homedir(), "config.js");
  if (existsSync(configPath)) {
    const { endpoint, apikey, registryURL, registryName } =
      await getCurrentConfig();

    if (endpoint && apikey && registryURL && registryName) {
      showCurrentConfig({ endpoint, apikey, registryURL, registryName });
      const useTheLatestConfig = await getLastConfig();

      if (useTheLatestConfig) {
        await generateNpmrc({
          endpoint,
          apikey,
          registryName,
          registryURL,
        });
      } else {
        dropCurrentConfig();
        const config = await addnewConfig();
        await generateNpmrc(config);
      }
    } else {
      const config = await addnewConfig();
      await generateNpmrc(config);
    }
  } else {
    const config = await addnewConfig();
    await generateNpmrc(config);
  }
} catch (error) {
  log.error(`${t("unexpectedError")}: ${error.message}`);
  process.exit(1);
}
