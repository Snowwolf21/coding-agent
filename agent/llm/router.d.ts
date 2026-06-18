import { OllamaProvider } from "./ollamaProvider.js";
import { OpenAIProvider } from "./openaiProvider.js";
export type TaskType = "planning" | "coding" | "review" | "debug" | "fast";
export declare function routeLLM(task: string): OllamaProvider | OpenAIProvider;
//# sourceMappingURL=router.d.ts.map