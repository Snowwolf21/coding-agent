import { agentState } from "../state.js";
import fs from "fs";

/**
 * Reject AI suggested edit
 */
export function rejectEdit(id: number) {
  const edit = agentState.project.suggestions.find(
    (e) => e.id === id
  );

  if (!edit) {
    return `❌ Edit ${id} not found`;
  }

  // File system rollback
  try {
    const backupPath = edit.path + ".backup";
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, edit.path);
      fs.unlinkSync(backupPath);
      console.log(`🔄 Rolled back file system for: ${edit.path}`);
    } else if (edit.original !== undefined && fs.existsSync(edit.path)) {
      // Fallback: restore from original content field
      fs.writeFileSync(edit.path, edit.original, "utf8");
      console.log(`🔄 Restored file system from memory for: ${edit.path}`);
    }
  } catch (err: any) {
    console.error(`⚠️ Failed to rollback file ${edit.path}:`, err.message);
  }

  agentState.project.suggestions =
    agentState.project.suggestions.filter(
      (e) => e.id !== id
    );

  console.log(`❌ Rejected edit ${id}`);

  return `Rejected edit ${id}`;
}