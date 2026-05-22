import { execSync } from "child_process";

export async function run() {
  execSync("npm run dev", { stdio: "inherit" });
}

export async function runrun() {
  execSync("rm -rf .next; run", { stdio: "inherit" });
}
