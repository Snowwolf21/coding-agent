import fs from "fs";
// import { createDiff } from "./diff.js";
import { agentState } from "../state.js";
import { dryRunEdit } from "./dryRun.js";
import * as Diff from "diff";
export function handleEditSuggestion(state, suggestion) {
    const fileContent = fs.readFileSync(suggestion.path, "utf8");
    // Define colors using native terminal ANSI codes (lightweight, zero dependencies)
    const oldCode = 'const a = 1;';
    const newCode = 'const a = 2;';
    const diffResult = Diff.diffLines(oldCode, newCode);
    for (const part of diffResult) {
        if (part.added) {
            // Print additions in green
            console.log(`+, ${part.value.trimEnd()}`);
        }
        else if (part.removed) {
            // Print removals in red
            console.log(`-, ${part.value.trimEnd()}`);
        }
        else {
            // Print unchanged lines normally
            console.log(`  ${part.value.trimEnd()}`);
        }
    }
    const pending = {
        id: Date.now(),
        path: suggestion.path,
        original: suggestion.original,
        updated: suggestion.updated,
        Diff,
    };
    const preview = dryRunEdit(pending.original, pending.updated);
    agentState.edits.preview.push(preview);
    console.log("\n🧠 AI SUGGESTED EDIT:");
    console.log(Diff);
    console.log(`\n👉 Use acceptEdit(${pending.id}) or rejectEdit(${pending.id})`);
    return {
        ...agentState,
        project: {
            ...state.project,
            suggestions: [
                ...state.project.suggestions,
                suggestion
            ]
        }
    };
}
//# sourceMappingURL=handleEditSuggestion.js.map