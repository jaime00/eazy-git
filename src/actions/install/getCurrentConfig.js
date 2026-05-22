import { log } from "@clack/prompts";
import os from "os";
import path from "path";
import { t } from "../../i18n/index.js";

const getCurrentConfig = async () => {
  const configPath = path.join(os.homedir(), "config.js");
  const config = await import(configPath).catch((error) => {
    log.error(`${t("unexpectedError")}: ${error.message}`);
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
