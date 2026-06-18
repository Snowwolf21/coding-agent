import { OllamaProvider, } from "./ollamaProvider.js";
import { OpenAIProvider, } from "./openaiProvider.js";
function detectTaskType(input) {
    const text = input.toLowerCase();
    if (text.includes("fix"))
        return "debug";
    if (text.includes("review"))
        return "review";
    if (text.includes("plan"))
        return "planning";
    if (text.includes("implement"))
        return "coding";
    return "fast";
}
export function routeLLM(task) {
    const type = detectTaskType(task);
    switch (type) {
        case "planning":
            return new OpenAIProvider(); // best reasoning
        case "coding":
            return new OllamaProvider(); // strong coder model
        case "review":
            return new OpenAIProvider(); // strict reasoning
        case "debug":
            return new OllamaProvider(); // fast iteration
        default:
            return new OllamaProvider(); // cheap default
    }
}
//# sourceMappingURL=router.js.map