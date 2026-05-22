import { text } from "@clack/prompts";
import chalk from "chalk";
import handleUserCancellation from "../../../utils/handleUserCancellation.js";

const getEndpointURL = async () => {
  const domain = await text({
    message: "🔗 Enter your endpoint URL:",
    placeholder: "",
    initialValue: "",
    required: true,
    validate(value) {
      if (!value?.trim()) return chalk.hex("#9ca3af")("⚠️ URL is required!");

      try {
        const url = new URL(value);
        if (!url.protocol.startsWith("http")) {
          return chalk.hex("#9ca3af")("❌ URL must use HTTP/HTTPS protocol");
        }
        if (!url.hostname) {
          return chalk.hex("#9ca3af")("❌ URL must include a hostname");
        }
        return undefined;
      } catch (error) {
        return chalk.hex("#9ca3af")("❌ Please enter a valid URL");
      }
    },
  });
  handleUserCancellation(domain);
  return domain;
};

export default getEndpointURL;
