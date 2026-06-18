import { OllamaProvider } from "./ollamaProvider.js";
const ollama = new OllamaProvider();
export const llm = {
    generate: (messages) => ollama.generate(messages),
};
//# sourceMappingURL=index.js.map