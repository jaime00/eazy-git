import { existsSync } from "fs";
import { log, cancel } from "@clack/prompts";
import chalk from "chalk";
import os from "os";
import path from "path";

import getLastConfig from "./src/getters/install/config/getLastConfig.js";
import addnewConfig from "./src/actions/install/addNewConfig.js";
import generateNpmrc from "./src/actions/install/generateNpmrc.js";
import dropCurrentConfig from "./src/actions/install/dropCurrentConfig.js";
import getCurrentConfig from "./src/actions/install/getCurrentConfig.js";
import showCurrentConfig from "./src/actions/install/showCurrentConfig.js";

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
  log.error(chalk.hex("#9ca3af")("An unexpected error occurred:"), error);
  process.exit(1);
}
