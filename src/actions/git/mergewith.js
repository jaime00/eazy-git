import { log } from "@clack/prompts";
import { execSync } from "child_process";

export default function mergeWith(args) {
  try {
    const branchName = args[0] ?? "develop";
    log.step("🔄 Fetching latest changes...");
    execSync("git fetch", { stdio: "inherit" });
    log.step(`🔄 Merging with ${branchName}...`);
    execSync(`git merge origin/${branchName}`, { stdio: "inherit" });
    log.step("🚀 Pushing merged changes...");
    execSync("git push origin HEAD", { stdio: "inherit" });
    log.success("✅ Merge completed successfully!");
  } catch (error) {
    log.error(`❌ Error: ${error.message}`);
  }
}
