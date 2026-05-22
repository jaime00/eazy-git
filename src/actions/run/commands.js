import { execSync } from "child_process";
import { log } from "@clack/prompts";

export async function run() {
  try {
    execSync("npm run dev", { stdio: "inherit" });
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export async function runrun() {
  try {
    execSync("rm -rf .next && npm run dev", { stdio: "inherit" });
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
