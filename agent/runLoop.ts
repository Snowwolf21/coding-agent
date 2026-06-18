import { handleToolCall } from "./core/handleToolCall.js";

export async function runAgentLoop(getAIResponse: any) {
  let messages: any[] = [];

  // initial user request
  messages.push({
    role: "user",
    content: getAIResponse.input,
  });

  while (true) {
    // 1. call AI
    const response = await getAIResponse(messages);

    let hasToolCall = false;

    // 2. process AI output
    for (const item of response.output) {
      if (item.type === "message") {
        messages.push({
          role: "assistant",
          content: item.content,
        });

        console.log("AI:", item.content);
      }

      if (item.type === "function_call") {
        hasToolCall = true;

        const result = await handleToolCall(item);

        console.log("TOOL RESULT:", result);

        // 3. SEND TOOL RESULT BACK TO AI
        messages.push({
          role: "tool",
          content: JSON.stringify({
            tool: item.name,
            result,
          }),
        });
      }
    }

    // 4. STOP CONDITION
    if (!hasToolCall) {
      break;
    }
  }

  return messages;
}