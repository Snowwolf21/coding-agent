import { conversationHistory } from './types.js';
import { llm } from "../llm/index.js";
import { handleToolCall } from "./handleToolCall.js";
import { tryParseOutput } from "./parseOutput.js";
export async function runToolLoop() {
    let hasToolCall = true;
    let finalOutput = "";
    while (hasToolCall) {
        hasToolCall = false;
        const response = await llm.generate(conversationHistory);
        const output = response.text;
        const parsed = tryParseOutput(output);
        if (parsed?.tool) {
            hasToolCall = true;
            const toolResult = await handleToolCall(parsed);
            conversationHistory.push({
                role: "tool",
                content: JSON.stringify(toolResult),
            });
            continue;
        }
        conversationHistory.push({
            role: "assistant",
            content: output,
        });
        finalOutput = output;
    }
    return finalOutput;
}
//# sourceMappingURL=toolLoop.js.map