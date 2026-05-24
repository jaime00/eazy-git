import { text } from "@clack/prompts";
import handleUserCancellation from "#utils/handleUserCancellation.js";
import { t } from "#i18n/index.js";
import { ui } from "#ui/theme.js";

const getRegistryName = async () => {
  const name = await text({
    message: ui.secondary(t("enterRegistryName")),
    placeholder: "",
    initialValue: "",
    required: true,
    validate(value) {
      if (!value?.trim()) return t("registryNameRequired");
      if (!/^[a-zA-Z]+$/.test(value)) return t("registryNameLettersOnly");
      return undefined;
    },
  });
  handleUserCancellation(name);
  return name;
};

export default getRegistryName;
