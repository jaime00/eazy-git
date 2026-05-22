import { unlinkSync } from "fs";
import { stream } from "@clack/prompts";
import os from "os";
import path from "path";

export default function dropCurrentConfig() {
  const configPath = path.join(os.homedir(), "config.js");
  unlinkSync(configPath);
}
