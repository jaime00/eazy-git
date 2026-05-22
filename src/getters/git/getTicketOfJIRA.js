import { text } from "@clack/prompts";
import validateTicketOfJIRA from "../../utils/validateTicketOfJIRA.js";
import handleUserCancellation from "../../utils/handleUserCancellation.js";

const getTicketOfJIRA = async () => {
  const ticket = await text({
    message: "🎫 Enter the JIRA ticket code:",
    placeholder: "DPW-0000",
    initialValue: "",
    validate(value) {
      if (value.length === 0) return `⚠️ JIRA code is required!`;
      if (!validateTicketOfJIRA(value))
        return `❌ JIRA code must have the format DPW-0000`;
    },
  });
  handleUserCancellation(ticket);
  return ticket;
};

export default getTicketOfJIRA;
