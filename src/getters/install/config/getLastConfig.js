import chalk from "chalk";
import { confirm } from "@clack/prompts";
import handleUserCancellation from "../../../utils/handleUserCancellation.js";

const getLastConfig = async () => {
  const config = await confirm({
    message: chalk.hex("#199288")("Would you like to use this configuration?"),
  });
  handleUserCancellation(config);
  return config;
};

export default getLastConfig;
