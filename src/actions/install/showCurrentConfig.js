import { log } from "@clack/prompts";
import chalk from "chalk";

export default function showCurrentConfig({
  endpoint,
  apikey,
  registryURL,
  registryName,
}) {
  log.info(`${chalk.hex("#199288")("⚙️  Current Configuration")}
${chalk.hex("#9ca3af")(`   └─ endpoint: ${endpoint}`)}
${chalk.hex("#9ca3af")(`   └─ apikey: ${apikey}`)}
${chalk.hex("#9ca3af")(`   └─ registryURL: ${registryURL}`)}
${chalk.hex("#9ca3af")(`   └─ registryName: ${registryName}`)}
`);
}
