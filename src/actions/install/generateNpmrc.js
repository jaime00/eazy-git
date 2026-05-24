import { writeFileSync } from "fs";
import { execSync } from "child_process";
import { log, spinner, outro } from "@clack/prompts";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

export default async function generateNpmrc({
  endpoint,
  apikey,
  registryName,
  registryURL,
}) {
  const s = spinner();
  try {
    s.start(t("installingDeps"));

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
    s.stop(ui.primary(t("depsInstalled")));
    outro(ui.success(t("operationCompleted")));
  } catch (error) {
    s.stop("");
    log.error(`${t("authFailed")}: ${error.message}`);
    process.exit(1);
  }
}
