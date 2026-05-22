import { isCancel, cancel } from "@clack/prompts";
import { t } from "../i18n/index.js";

export default function handleUserCancellation(input) {
  if (isCancel(input)) {
    cancel(t("operationCancelled"));
    return process.exit(0);
  }
}
