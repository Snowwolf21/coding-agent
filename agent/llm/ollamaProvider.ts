import fetch from "node-fetch";

export class OllamaProvider {
  model = "qwen2.5-coder:7b"; 

  async generate(messages: any): Promise<{ text: string }> {
    // 💡 FIXED: If an agent passes a raw string instead of an array, format it for Ollama
    const formattedMessages = typeof messages === "string" 
      ? [{ role: "user", content: messages }] 
      : messages;

    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages, // 👈 Pass the guaranteed array format
          stream: false,
        }),
      }
    );

    const data = (await response.json()) as any;

    let responseText = "";
    if (data?.message?.content) {
      responseText = data.message.content;
    } else if (data?.response) {
      responseText = data.response;
    } else if (data?.error) {
      responseText = `Ollama Error: ${data.error}`; // Catch Ollama internal errors
    } else {
      responseText = "Error: Local model failed to yield a valid response text layout.";
    }

    return { text: responseText };
  }
}
