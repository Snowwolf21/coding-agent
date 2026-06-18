import fs from "fs";
import { agentState } from "../state.js";
import {
  validateFilePath,
  validateEditContent,
} from "./safety.js";

export function acceptEdit(id: number) {
  const edit = agentState.project.suggestions.find(
    (e) => e.id === id
  );

  if (!edit) {
    return `❌ Edit not found`;
  }

  try {
    // 🔐 STEP 1: validate file path
    validateFilePath(edit.path);

    const currentContent = fs.readFileSync(
      edit.path,
      "utf8"
    );

    // 🔐 STEP 2: ensure original exists
    if (!currentContent.includes(edit.original)) {
      throw new Error("Original code not found");
    }

    // 🔐 STEP 3: validate change safety
    validateEditContent(
      edit.original,
      edit.updated
    );

    // apply edit safely
    const updatedContent = currentContent.replace(
      edit.original,
      edit.updated
    );

    fs.writeFileSync(edit.path, updatedContent);

    agentState.project.suggestions =
      agentState.project.suggestions.filter(
        (e) => e.id !== id
      );

    console.log(`✅ Safe edit applied: ${edit.path}`);

    return `Applied safely`;
  } catch (err: any) {
    console.error(`❌ Safety blocked edit:`, err.message);
    return `Blocked: ${err.message}`;
  }
}