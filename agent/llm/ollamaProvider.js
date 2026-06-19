import fetch from "node-fetch";
import { toolPrompt } from "../prompts/toolPrompt.js";
export class OllamaProvider {
    model = "qwen2.5-coder:7b";
    async generate(messages) {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: toolPrompt ||
                            "You are a coding assistant. Respond with either JSON tool calls or direct answers."
                    },
                    ...messages
                ],
                stream: false,
                options: {
                    temperature: 0.2
                }
            }),
        });
        const raw = await response.text();
        console.log("🧠 RAW OLLAMA RESPONSE:\n", raw);
        let data;
        try {
            data = JSON.parse(raw);
        }
        catch (e) {
            throw new Error("Invalid JSON from Ollama:\n" + raw);
        }
        if (!response.ok) {
            throw new Error("Ollama HTTP error:\n" + JSON.stringify(data));
        }
        const text = data?.message?.content ??
            data?.response ??
            "";
        if (!text) {
            throw new Error("No usable text in Ollama response:\n" +
                JSON.stringify(data, null, 2));
        }
        return {
            text
        };
    }
}
//# sourceMappingURL=ollamaProvider.js.map