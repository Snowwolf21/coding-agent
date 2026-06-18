import { OllamaProvider } from "./ollamaProvider.js";

const ollama = new OllamaProvider();

export const llm = {
  generate: (messages: any[]) =>
    ollama.generate(messages),
};