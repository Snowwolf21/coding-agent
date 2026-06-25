import { type Dispatch, type SetStateAction } from "react";
import type { ChatMessage } from "../types.js";

export function addSystemMessage(
  setChat: Dispatch<SetStateAction<ChatMessage[]>>, 
  text: string
) {
  setChat((prev) => [...prev, { role: "system", content: text }]);
}
