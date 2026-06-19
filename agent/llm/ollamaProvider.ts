import fetch from "node-fetch";
import { toolPrompt } from "../prompts/toolPrompt.js";
import { validateMessages } from "../utils/validateMessages.js";
export class OllamaProvider {
  model = "qwen2.5-coder:7b"; 

  async generate(messages: any): Promise<{ text: string; raw?: any }> {
    // 1. Defensively convert incoming messages to correct Ollama API shape
    let normalizedMessages: Array<{ role: string; content: string }> = [];
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
    if (typeof messages === "string") {
      // If a single string was passed directly
      normalizedMessages = [{ role: "user", content: messages }];
    } else if (Array.isArray(messages)) {
      // If an array was passed, ensure every element is an object
      normalizedMessages = messages.map((msg) => {
        if (typeof msg === "string") {
          return { role: "user", content: msg };
        }
        return msg;
      });
    } else if (messages && typeof messages === "object" && messages.role && messages.content) {
      // If a single message object was passed
      normalizedMessages = [messages];
    } else {
      throw new Error("Invalid format for messages passed to OllamaProvider.generate");
    }

    // 2. Build the final payload with the system prompt
    const finalMessages = [
      {
        role: "system",
        content:
          toolPrompt ||
          "You are a coding assistant. Respond with either JSON tool calls or direct answers."
      },
      ...normalizedMessages
    ];
    if (!Array.isArray(messages)) {
  throw new Error("Messages must be an array");
}

for (const msg of messages) {
  if (!msg.role || !msg.content) {
    console.log("BAD MESSAGE:", msg);
    throw new Error("Invalid message format detected");
  }
}

    const response = await fetch("http://localhost:11434/api/chat", {
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
    } catch (e) {
      throw new Error("Invalid JSON from Ollama:\n" + raw);
    }

    if (!response.ok) {
      throw new Error("Ollama HTTP error:\n" + JSON.stringify(data));
    }

    const text =
      data?.message?.content ??
      data?.response ??
      "";

    if (!text) {
      throw new Error(
        "No usable text in Ollama response:\n" +
        JSON.stringify(data, null, 2)
      );
    }

    return {
      text
    };
  }
}