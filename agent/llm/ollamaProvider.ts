import fetch from "node-fetch";
import { toolPrompt } from "../prompts/toolPrompt.js";
import { validateMessages } from "../utils/validateMessages.js";

type OllamaMessage = { role: string; content: string };

export class OllamaProvider {
  model = "qwen2.5-coder:7b"; 

  private normalizeMessages(messages: any): OllamaMessage[] {
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

  private withSystemPrompt(messages: OllamaMessage[]): OllamaMessage[] {
    return [
      {
        role: "system",
        content:
          toolPrompt ||
          "You are a coding assistant. Respond with either JSON tool calls or direct answers."
      },
      ...messages
    ];
  }

  async generate(messages: any): Promise<{ text: string; raw?: any }> {
    // 1. Defensively convert incoming messages to correct Ollama API shape
    let normalizedMessages: OllamaMessage[] = [];
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

  async *stream(messages: any): AsyncGenerator<string> {
    const check = validateMessages(messages);

    if (!check.ok) {
      throw new Error(check.error);
    }

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.withSystemPrompt(this.normalizeMessages(messages)),
        stream: true,
        options: {
          temperature: 0.2
        }
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama HTTP error:\n" + await response.text());
    }

    if (!response.body) {
      throw new Error("Ollama returned no response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    for await (const chunk of response.body as any) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const data = JSON.parse(trimmed);
        const token = data?.message?.content ?? data?.response ?? "";

        if (token) {
          yield token;
        }

        if (data?.done) {
          return;
        }
      }
    }

    const trailing = buffer.trim();
    if (trailing) {
      const data = JSON.parse(trailing);
      const token = data?.message?.content ?? data?.response ?? "";
      if (token) {
        yield token;
      }
    }
  }
}
