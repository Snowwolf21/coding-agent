import { applyEdit } from "../tools/applyEdit.js";
import type { AgentAction } from "../types.js";

export function executeAction(action: AgentAction) {
  switch (action.action) {
    case "edit_file": {
      const result = applyEdit(
        action.path,
        action.patch || ""
      );

      console.log("✏️", result);
      return result;
    }
  }
}