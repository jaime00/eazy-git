import { log } from "@clack/prompts";
import { execSync } from "child_process";

export default function removelast() {
  try {
    log.step("⏪ Removing last commit...");
    execSync("git reset --soft HEAD~1", { stdio: "inherit" });
    log.success("✅ Last commit removed successfully!");
  } catch (error) {
    log.error(`❌ Error: ${error.message}`);
  }
}
