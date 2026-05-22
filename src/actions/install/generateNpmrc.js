import { writeFileSync } from "fs";
import { execSync } from "child_process";
import { log, stream, spinner, outro } from "@clack/prompts";
import chalk from "chalk";
import { setTimeout as sleep } from "node:timers/promises";

export default async function generateNpmrc({
  endpoint,
  apikey,
  registryName,
  registryURL,
}) {
  try {
    const s = spinner();
    s.start("Installing dependencies...");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { apikey },
    });

    const authToken = await response.text();
    const npmrcContent = `registry=https://registry.npmjs.org/
@${registryName}:registry=https://${registryURL}/
//${registryURL}/:always-auth=true
//${registryURL}/:_authToken=${authToken}
`;
    writeFileSync("./.npmrc", npmrcContent);
    execSync("npm i", { stdio: "inherit" });
    s.stop(chalk.hex("#57d7c4")("🎉 All dependencies were installed"));
    await sleep(1000);
  } catch (error) {
    log.error(chalk.hex("#9ca3af")("❌ Authentication failed:"), error.message);
    console.log("error.message: ", error.message);
  } finally {
    process.exit(1);
  }
}
