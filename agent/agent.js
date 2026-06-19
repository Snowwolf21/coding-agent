import { OllamaProvider } from "./llm/ollamaProvider.js";
import { parseLLMJson } from "./utils/jsonParser.js";
// Dummy tools structure to match what your environment might run
const tools = {
    readFile: async (args) => {
        console.log(`📂 [Tool Run] Mock reading file: ${args.filePath}`);
        return `Content of ${args.filePath}: {}`;
    }
};
export async function agent(messages) {
    const provider = new OllamaProvider();
    // 1. Send conversation history to the model
    const response = await provider.generate(messages);
    let action;
    try {
        // 2. Use the new robust parsing helper instead of raw JSON.parse
        action = parseLLMJson(response.text);
    }
    catch (error) {
        throw new Error(`Model did not return valid JSON:\n${response.text}\nReason: ${error.message}`);
    }
    // 3. Handle the structured agent logic (Tool Call vs Final Answer)
    if (action.type === "tool_call") {
        const toolName = action.tool;
        const toolArgs = action.arguments;
        if (tools[toolName]) {
            const toolResult = await tools[toolName](toolArgs);
            // Return details for your loop to append to messages and run another step
            return {
                step: "tool_executed",
                tool: toolName,
                args: toolArgs,
                result: toolResult,
                updatedHistory: [
                    ...messages,
                    { role: "assistant", content: response.text },
                    { role: "user", content: `Tool execution result:\n${toolResult}` }
                ]
            };
        }
        else {
            throw new Error(`Unknown tool requested by model: ${toolName}`);
        }
    }
    if (action.type === "final") {
        return {
            step: "finished",
            content: action.content
        };
    }
    throw new Error(`Unexpected response type from model: ${action.type}`);
}
//# sourceMappingURL=agent.js.map