import { applyEdit } from "../tools/applyEdit.js";

export function executeAction(action: any) {
  switch (action.action) {
    case "edit_file": {
      const result = applyEdit(
        action.path,
        action.patch
      );

      console.log("✏️", result);
      return result;
    }
  }
}