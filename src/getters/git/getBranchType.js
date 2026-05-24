import { select } from "@clack/prompts";
import handleUserCancellation from "#utils/handleUserCancellation.js";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

const getBranchType = async () => {
  const branch = await select({
    message: ui.secondary(t("selectBranchType")),
    options: [
      { value: "fix", label: t("branchFix") },
      { value: "improvement", label: t("branchImprovement") },
      { value: "feature", label: t("branchFeature") },
      { value: "refactor", label: t("branchRefactor") },
    ],
  });
  handleUserCancellation(branch);
  return branch;
};

export default getBranchType;
