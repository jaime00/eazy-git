import { log } from "@clack/prompts";
import { execSync } from "child_process";

export default function pull() {
  try {
    log.step("📥 Fetching remote changes...");
    execSync("git fetch", { stdio: "inherit" });
    log.success("📦 Pulling changes into your branch...");
    execSync("git pull origin HEAD", { stdio: "inherit" });
  } catch (error) {
    log.error(`💥 Error: ${error.message}`);
  }
}
