import { existsSync } from "fs";
import { join } from "path";

const hasGitInstalled = () => {
  const gitDir = join(process.cwd(), ".git");
  if (!existsSync(gitDir)) {
    console.error("❌ This directory is not a git repository");
    process.exit(1);
  }
};

export default hasGitInstalled;
