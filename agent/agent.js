import { OllamaProvider } from "./llm/ollamaProvider.js";
import { parseLLMJson } from "./utils/jsonParser.js";
import { executeTool } from "./tools/executeTool.js";
const MAX_ITERATIONS = 10;
export async function agent(messages) {
    const provider = new OllamaProvider();
    // SYSTEM PROMPT (strict + clean)
    if (!messages.some((m) => m.role === "system")) {
        messages.unshift({
            role: "system",
            content: `
You are an autonomous agent.

Return ONLY valid JSON:

FINAL:
{ "type": "final", "content": "..." }

TOOL CALL:
{ "type": "tool_call", "tool": "...", "arguments": {} }

No markdown. No backticks. No extra text.
`,
        });
    }
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const response = await provider.generate(messages);
        const raw = response?.text;
        console.log("🧠 RAW LLM:", raw);
        if (!raw || typeof raw !== "string") {
            return {
                success: true,
                content: "Empty LLM response",
            };
        }
        let action;
        try {
            action = parseLLMJson(raw);
        }
        catch {
            // fallback: NEVER break UI
            return {
                success: true,
                content: raw,
            };
        }
        if (!action?.type) {
            return {
                success: true,
                content: raw,
            };
        }
        // TOOL CALL
        if (action.type === "tool_call") {
            const toolResult = await executeTool(action.tool, action.arguments || {});
            messages.push({
                role: "assistant",
                content: raw,
            });
            messages.push({
                role: "user",
                content: JSON.stringify(toolResult),
            });
            continue;
        }
        // FINAL ANSWER
        if (action.type === "final") {
            return {
                success: true,
                content: action.content || "No content returned",
            };
        }
        return {
            success: true,
            content: raw,
        };
    }
    return {
        success: true,
        content: "Agent stopped (max iterations reached)",
    };
}
//# sourceMappingURL=agent.js.map