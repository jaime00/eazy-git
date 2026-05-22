import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const getCurrentPackageVersion = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packageJson = JSON.parse(
    readFileSync(resolve(__dirname, "../package.json"), "utf8"),
  );
  return packageJson?.version;
};

export default getCurrentPackageVersion;
