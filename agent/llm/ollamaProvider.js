import { toolPrompt } from "../prompts/toolPrompt.js";
import { validateMessages } from "../utils/validateMessages.js";
export class OllamaProvider {
    model = "qwen2.5-coder:7b";
    normalizeMessages(messages) {
        if (typeof messages === "string") {
            return [{ role: "user", content: messages }];
        }
        if (Array.isArray(messages)) {
            return messages.map((msg) => {
                if (typeof msg === "string") {
                    return { role: "user", content: msg };
                }
                return msg;
            });
        }
        if (messages && typeof messages === "object" && messages.role && messages.content) {
            return [messages];
        }
        throw new Error("Invalid format for messages passed to OllamaProvider.generate");
    }
    withSystemPrompt(messages) {
        return [
            {
                role: "system",
                content: toolPrompt ||
                    "You are a coding assistant. Respond with either JSON tool calls or direct answers."
            },
            ...messages
        ];
    }
    async generate(messages) {
        // 1. Defensively convert incoming messages to correct Ollama API shape
        let normalizedMessages = [];
        const check = validateMessages(messages);
        if (!check.ok) {
            console.error("❌ Message validation failed:", check);
            // IMPORTANT: do NOT crash agent
            return {
                text: JSON.stringify({
                    type: "error",
                    message: check.error,
                    index: check.index
                })
            };
        }
        normalizedMessages = this.normalizeMessages(messages);
        // 2. Build the final payload with the system prompt
        const finalMessages = this.withSystemPrompt(normalizedMessages);
        if (!Array.isArray(messages)) {
            throw new Error("Messages must be an array");
        }
        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                console.log("BAD MESSAGE:", msg);
                throw new Error("Invalid message format detected");
            }
        }
        const base = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
        const response = await fetch(`${base}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages: finalMessages,
                stream: false,
                options: {
                    temperature: 0.2
                }
            }),
        });
        const raw = await response.text();
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
    async *stream(messages) {
        const base = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
        const response = await fetch(`${base}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages: this.withSystemPrompt(this.normalizeMessages(messages)),
                stream: true,
                options: {
                    temperature: 0.2,
                    num_ctx: 4096,
                }
            }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        if (!response.body) {
            throw new Error("No response body from Ollama");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);
                if (!line)
                    continue;
                let json;
                try {
                    json = JSON.parse(line);
                }
                catch {
                    // Wait for more data if JSON is incomplete
                    buffer = line + "\n" + buffer;
                    break;
                }
                if (json.message?.content) {
                    yield json.message.content;
                }
                if (json.done) {
                    return;
                }
            }
        }
    }
}
//# sourceMappingURL=ollamaProvider.js.map