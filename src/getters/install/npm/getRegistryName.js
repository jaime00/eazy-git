import { text } from "@clack/prompts";
import handleUserCancellation from "../../../utils/handleUserCancellation.js";

const getRegistryName = async () => {
  const name = await text({
    message: "📦 Enter your NPM registry name (without special characters):",
    placeholder: "",
    initialValue: "",
    required: true,
    validate(value) {
      if (!value?.trim()) return `⚠️ Registry name is required!`;

      if (!/^[a-zA-Z]+$/.test(value)) {
        return `❌ Registry name must contain only letters`;
      }

      return undefined;
    },
  });
  handleUserCancellation(name);
  return name;
};

export default getRegistryName;
