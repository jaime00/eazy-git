import { existsSync, writeFileSync } from "fs";
import { log, intro } from "@clack/prompts";
import chalk from "chalk";
import os from "os";
import path from "path";

import getEndpointURL from "../../getters/install/token/getEndpointURL.js";
import getApiKey from "../../getters/install/token/getApiKey.js";

import getRegistryName from "../../getters/install/npm/getRegistryName.js";
import getRegistryURL from "../../getters/install/npm/getRegistryURL.js";

import isEmpty from "../../utils/isEmpty.js";

const addNewConfig = async () => {
  intro(`${chalk.hex("#57d7c4")("⚙️  Setting up your configuration")}`);
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
    log.error(
      chalk.hex("#9ca3af")("❌ Missing required configuration values."),
    );
    process.exit(1);
    return;
  }
  const config = {
    endpoint,
    apikey,
    registryName,
    registryURL,
  };

  const configContent = `export default ${JSON.stringify(config, null, 2)}`;
  try {
    const configPath = path.join(os.homedir(), "config.js");
    writeFileSync(configPath, configContent);
    log.success(chalk.hex("#57d7c4")("⚙️  Configuration saved"));
  } catch (error) {
    log.error(chalk.hex("#9ca3af")("❌ Error writing configuration file:"));
    console.log(error);
    process.exit(1);
  }
  return config;
};

export default addNewConfig;
