import { log, confirm, text } from "@clack/prompts";
import { execSync } from "child_process";
import getEnviroment from "../../getters/git/getEnviroment.js";
import getCurrentBranch from "../../getters/git/getCurrentBranch.js";
import handleUserCancellation from "../../utils/handleUserCancellation.js";

const createTemporalBranch = async () => {
  try {
    const enviroment = await getEnviroment();
    const branchName = getCurrentBranch();
    // Paso 1: Crear y cambiar a la nueva rama temporal
    const tempBranchName = `${branchName}-${enviroment}`;
    execSync(`git checkout -b ${tempBranchName} origin/${enviroment}`, {
      stdio: "inherit",
    });
    log.success("🌿 Temporal branch created successfully");

    // Paso 2: Fusionar los cambios de la rama original
    execSync(`git merge origin/${branchName}`, { stdio: "inherit" });
    log.success("🔀 Temporal branch merged successfully");

    // Paso 3: Verificar si hay conflictos
    const status = execSync("git status --porcelain", { encoding: "utf-8" });
    if (status.includes("UU")) {
      // Paso 4: Resolver conflictos
      log.warn("⚠️ Conflicts detected. Please resolve them manually!");
      return;
    }

    execSync(`git push origin ${tempBranchName}`, { stdio: "inherit" });
    log.info("🚀 Branch pushed to remote repository");

    const hasToRemoveTemporalBranch = await confirm({
      message: "Do you want to remove the temporal branch?",
    });
    handleUserCancellation(hasToRemoveTemporalBranch);

    if (hasToRemoveTemporalBranch) {
      execSync(`git checkout ${branchName}`, { stdio: "inherit" });
      execSync(`git branch -D ${tempBranchName}`, { stdio: "inherit" });
      log.info("🗑️ Temporal branch deleted successfully");
    }
  } catch (error) {
    console.error("❌ Error creating the temporal branch:", error);
  }
};
export default createTemporalBranch;
