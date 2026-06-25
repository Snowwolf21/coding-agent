import { type Dispatch, type SetStateAction } from "react";
import type { ChatMessage } from "../types";

const API_BASE = "http://localhost:3001";

interface SendMessageContext {
  setChat: Dispatch<SetStateAction<ChatMessage[]>>;
  code: string;
  filePath: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  runMode: string;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
}

type SseEvent = {
  event: string;
  data: any;
};

async function readSse(response: Response, onEvent: (event: SseEvent) => void) {
  if (!response.body) {
    throw new Error("Streaming response did not include a body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function drainBuffer(final = false) {
    const frames = buffer.split("\n\n");
    buffer = final ? "" : frames.pop() ?? "";

    for (const frame of frames) {
      const lines = frame.split("\n");
      const event =
        lines.find((line) => line.startsWith("event:"))?.slice(6).trim() ||
        "message";
      const dataLines = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim());
      const rawData = dataLines.join("\n");

      if (!rawData) continue;

      onEvent({
        event,
        data: JSON.parse(rawData),
      });
    }
  }

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    drainBuffer();
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    buffer += "\n\n";
    drainBuffer(true);
  }
}

export default function handleSendMessages({
  setChat,
  code,
  filePath,
  setLoading,
  runMode,
  message,
  setMessage,
}: SendMessageContext) {
  return async function handleSendMessage() {
    const outgoingMessage = message.trim();
    if (!outgoingMessage) return;

    setChat((p) => [...p, { role: "user", content: outgoingMessage }]);
    setMessage("");
    setLoading(true);

    try {
      if (runMode === "direct-chat") {
        let streamedText = "";
        let receivedToken = false;

        setChat((p) => [...p, { role: "assistant", content: "" }]);

        const response = await fetch(API_BASE + "/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            prompt: outgoingMessage,
            filePath,
            code,
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        await readSse(response, ({ event, data }) => {
          if (event === "token") {
            receivedToken = true;
            streamedText += data.token ?? "";
            setLoading(false);
            setChat((p) =>
              p.map((msg, index) =>
                index === p.length - 1
                  ? { ...msg, content: streamedText }
                  : msg
              )
            );
          }

          if (event === "error") {
            throw new Error(data.message || "Streaming request failed");
          }
        });

        if (!receivedToken) {
          setChat((p) =>
            p.map((msg, index) =>
              index === p.length - 1
                ? { ...msg, content: "No response from agent" }
                : msg
            )
          );
        }

        return;
      }

      const endpoint =
        runMode === "orchestrate" ? "/orchestrate" : "/chat";

      const response = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: outgoingMessage,
          filePath,
          code,
        }),
      });

      const data = await response.json();
    console.log("RESPONSE DATA:", data);
      if (!data.success) {
  throw new Error(
    data.error ||
    data.message ||
    "Request failed"
  );
}
      
     const assistantMessage =
  data.content ??
  data.message ??
  data.result ??
  data.response ??
  "No response from agent";

  console.log("MESSAGE:", data.message);
      setChat((p) => [
        ...p,
        {
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (err: any) {
      setChat((p) => [
        ...p,
        {
          role: "system",
          content: `❌ ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
}
