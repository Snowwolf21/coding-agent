import { type Dispatch, type SetStateAction } from "react";
import { addSystemMessage } from "./addSystemMessage.js";
import type { ChatMessage } from "../types.js";

const API_BASE = "http://localhost:3001";

interface LoadFileContext {
  setFilePath: Dispatch<SetStateAction<string>>;
  setCode: Dispatch<SetStateAction<string>>;
  setChat: Dispatch<SetStateAction<ChatMessage[]>>;
}

export default function loadFiles({
  setFilePath,
  setCode,
  setChat
}: LoadFileContext) {
  return async function loadFile(selectedPath: string) {
    setFilePath(selectedPath);
    try {
      const response = await fetch(`${API_BASE}/read-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: selectedPath })
      });

      // ✨ FIX 1: Verify the server communication channel is actually green
      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      // ✨ FIX 2: Safeguard against non-JSON content formatting responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const structuralFallbackText = await response.text();
        throw new Error(`Server did not return valid JSON content. Payload received: ${structuralFallbackText.substring(0, 50)}...`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Unknown filesystem error");
      
      setCode(data.data);
    } catch (err: any) {
      console.error("File Loading Error:", err);
      // Fallback updates error message downstream cleanly inside your workspace dashboard
      addSystemMessage(setChat, `❌ Failed to read file: ${selectedPath} (${err.message})`);
    }
  };
}
