import { unlinkSync } from "fs";
import os from "os";
import path from "path";

export default function dropCurrentConfig() {
  try {
    const configPath = path.join(os.homedir(), "config.js");
    unlinkSync(configPath);
  } catch {
    // config file doesn't exist, nothing to do
  }
}
