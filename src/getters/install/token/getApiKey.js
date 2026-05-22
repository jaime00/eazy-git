import { text } from "@clack/prompts";
import handleUserCancellation from "../../../utils/handleUserCancellation.js";
import { t } from "../../../i18n/index.js";
import { ui } from "../../../ui/theme.js";

const getApiKey = async () => {
  const apikey = await text({
    message: ui.secondary(t("enterApiKey")),
    placeholder: "",
    initialValue: "",
    required: true,
    validate(value) {
      if (!value?.trim()) return t("apiKeyRequired");
      return undefined;
    },
  });
  handleUserCancellation(apikey);
  return apikey;
};

export default getApiKey;
