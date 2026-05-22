import { log } from "@clack/prompts";

import { run, runrun } from "./src/run-actions/commands.js";

const comannd = process.argv[1].split("/").pop();

const commands = {
  run,
  runrun,
};

async function main() {
  try {
    const commandToExecute = commands[comannd];
    if (!commandToExecute) {
      log.error(`Unknown command: ${comannd}`);
      process.exit(1);
    }

    await commandToExecute();
    process.exit(0);
  } catch (error) {
    log.error(`Error executing command: ${error.message}`);
    process.exit(1);
  }
}

main();
