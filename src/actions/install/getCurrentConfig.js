import { log } from "@clack/prompts";
import chalk from "chalk";
import os from "os";
import path from "path";

const getCurrentConfig = async () => {
  const configPath = path.join(os.homedir(), "config.js");
  const config = await import(configPath).catch((error) => {
    log.error(chalk.hex("#9ca3af")("Error loading configuration:"), error);
    process.exit(1);
  });

  return {
    endpoint: config?.default?.endpoint,
    apikey: config?.default?.apikey,
    registryName: config?.default?.registryName,
    registryURL: config?.default?.registryURL,
  };
};

export default getCurrentConfig;
