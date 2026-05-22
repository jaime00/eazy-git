import { select } from "@clack/prompts";
import handleUserCancellation from "../../utils/handleUserCancellation.js";
import { t } from "../../i18n/index.js";
import { ui } from "../../ui/theme.js";

const getEnvironment = async () => {
  const environment = await select({
    message: ui.secondary(t("mergeBranchQuestion")),
    options: [
      { value: "develop", label: t("developDEV") },
      { value: "release", label: t("releaseUAT") },
    ],
    required: true,
    initialValue: "develop",
  });
  handleUserCancellation(environment);
  return environment;
};

export default getEnvironment;
