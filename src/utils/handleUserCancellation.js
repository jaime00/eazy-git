import { isCancel, cancel } from "@clack/prompts";

export default function handleUserCancellation(input) {
  if (isCancel(input)) {
    cancel("❌ Operation cancelled. Exiting...");
    return process.exit(0);
  }
}
