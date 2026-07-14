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


type TokenEvent = { event: "token"; data: { token: string } };
type ErrorEvent = { event: "error"; data: { message: string } };
type OtherEvent = { event: string; data: unknown };

type SseEvent = TokenEvent | ErrorEvent | OtherEvent;

// ---------- Detect coding tasks ----------
function isCodingTask(prompt: string): boolean {
  const text = prompt.toLowerCase();

  const keywords = [
    "build",
    "create",
    "implement",
    "generate",
    "write",
    "code",
    "fix",
    "bug",
    "debug",
    "edit",
    "modify",
    "update",
    "refactor",
    "optimize",
    "feature",
    "component",
    "function",
    "class",
    "typescript",
    "javascript",
    "react",
    "next",
    "node",
    "express",
    "api",
    "server",
    "frontend",
    "backend",
    "database",
    "sql",
    "mongodb",
    "prisma",
    "tailwind",
    "css",
    "html",
    "test",
    "unit test",
    "integration test"
  ];

  return keywords.some((keyword) => text.includes(keyword));
}

async function readSse(
  response: Response,
  onEvent: (event: SseEvent) => void
) {
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
        lines.find((l) => l.startsWith("event:"))?.slice(6).trim() ||
        "message";

      const dataLines = lines
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim());

      if (!dataLines.length) continue;

      onEvent({
        event,
        data: JSON.parse(dataLines.join("\n")),
      });
    }
  }

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, {
      stream: true,
    });

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

    setChat((prev) => [
      ...prev,
      {
        role: "user",
        content: outgoingMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      // -----------------------------
      // Streaming chat mode
      // -----------------------------
      if (runMode === "direct-chat") {
        let streamed = "";
        let received = false;

        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
          },
        ]);

        const response = await fetch(
          API_BASE + "/chat/stream",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({
              prompt: outgoingMessage,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

       await readSse(response, ({ event, data }) => {
  if (event === "token") {
    received = true;

    const tokenData = data as { token: string };

    streamed += tokenData.token ?? "";

    setChat((prev) =>
      prev.map((msg, index) =>
        index === prev.length - 1
          ? {
              ...msg,
              content: streamed,
            }
          : msg
      )
    );
  }

  if (event === "error") {
    const errorData = data as { message: string };

    throw new Error(errorData.message);
  }
});

        if (!received) {
          setChat((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? {
                    ...msg,
                    content:
                      "No response received.",
                  }
                : msg
            )
          );
        }

        return;
      }

      // -----------------------------------------
      // Automatic routing
      // -----------------------------------------
      const endpoint = isCodingTask(outgoingMessage)
        ? "/orchestrate"
        : "/chat";

      console.log(
        "Routing to:",
        endpoint
      );

      const response = await fetch(
        API_BASE + endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt: outgoingMessage,
            filePath,
            code,
          }),
        }
      );

      const data = await response.json();

      console.log("SERVER:", data);

      if (!data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Request failed"
        );
      }

      const assistantMessage =
        data.message ??
        data.content ??
        data.result ??
        data.response ??
        "No response";

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
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