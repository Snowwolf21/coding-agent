import { type Dispatch, type SetStateAction } from "react";
import { addSystemMessage } from "./addSystemMessage.js";
import type { ChatMessage } from "../types.js"; // ✨ Import type

interface SaveFileContext {
  filePath: string;
  code: string;
  setChat: Dispatch<SetStateAction<ChatMessage[]>>; // ✨ Update this line
}

export default function saveFiles({
  filePath,
  code,
  setChat
}: SaveFileContext) {
  return async function saveFile() {
    try {
      const response = await fetch("http://localhost:3001/write-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, content: code })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      addSystemMessage(setChat, `💾 Saved: ${filePath}`);
    } catch (err: any) {
      addSystemMessage(setChat, `❌ Save failed: ${err.message}`);
    }
  };
}
