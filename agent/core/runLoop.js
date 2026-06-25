import { llm } from "../llm/index.js";
import { conversationHistory } from "../core/types.js";
import { parseLLMJson } from "../utils/jsonParser.js";
import { executeAction } from "./executeAction.js";
// import { handleToolCall } from "./handleToolCall.js";
import { stateAgent } from "../state.js";
import { compressMemory } from "./compressMemory.js";
import { ToolManager } from "./toolManager/toolManager.js";
export function mapMessages(history) {
    return history.map(msg => ({
        role: msg.role === "tool"
            ? "assistant"
            : msg.role,
        content: msg.content,
    }));
}
export async function runLoop(input) {
    conversationHistory.push({
        role: "user",
        content: input,
    });
    let iteration = 0;
    let keepRunning = true;
    while (iteration < stateAgent.maxIterations &&
        keepRunning) {
        iteration++;
        const response = await llm.generate(mapMessages(conversationHistory));
        const textOutput = response.text;
        console.log("AI:", textOutput);
        // 1. JSON ACTION PARSER
        const parsed = parseLLMJson(textOutput);
        if (parsed) {
            executeAction(parsed);
        }
        const toolManager = new ToolManager();
        // 2. TOOL CALL HANDLER (ONLY ONE SYSTEM)
        if (parsed?.tool) {
            const result = await toolManager.execute(parsed.tool, parsed.args);
            conversationHistory.push({
                role: "tool",
                content: JSON.stringify(result),
            });
            compressMemory(conversationHistory);
            continue;
        }
        keepRunning = false;
        conversationHistory.push({
            role: "assistant",
            content: textOutput,
        });
    }
    return conversationHistory.at(-1)?.content;
}
//# sourceMappingURL=runLoop.js.map