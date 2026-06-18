import fetch from "node-fetch";
export class OllamaProvider {
    model = "qwen2.5-coder";
    async generate(messages) {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                stream: false,
            }),
        });
        const data = (await response.json());
        return {
            text: data.message.content,
        };
    }
}
//# sourceMappingURL=ollamaProvider.js.map