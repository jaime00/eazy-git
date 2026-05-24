import { text } from "@clack/prompts";
import handleUserCancellation from "#utils/handleUserCancellation.js";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

const getRegistryURL = async () => {
  const URL = await text({
    message: ui.secondary(t("enterRegistryURL")),
    placeholder: "",
    initialValue: "",
    required: true,
    validate(value) {
      if (!value?.trim()) return t("registryURLRequired");
      if (!/^[a-zA-Z0-9]/.test(value[0].trim()))
        return t("registryURLStartWithName");
      if (value.startsWith("http")) return t("registryURLNoProtocol");
      if (value.startsWith("/")) return t("registryURLNoSlash");
      if (value.startsWith("www")) return t("registryURLNoWWW");
    },
  });
  handleUserCancellation(URL);
  return URL;
};

export default getRegistryURL;
