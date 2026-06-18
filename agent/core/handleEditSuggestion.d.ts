import { agentState, type EditSuggestion } from "../state.js";
export declare function handleEditSuggestion(state: typeof agentState, suggestion: EditSuggestion): {
    project: {
        suggestions: EditSuggestion[];
    };
    debug: {
        lastCommand: string;
        lastError: string;
        attempts: number;
    };
    edits: {
        pending: never[];
        preview: never[];
    };
};
//# sourceMappingURL=handleEditSuggestion.d.ts.map