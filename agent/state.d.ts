export interface EditSuggestion {
    id: number;
    path: string;
    original: any;
    updated: any;
    diff: string;
    preview: boolean;
}
export declare const agentState: {
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
export declare const stateAgent: {
    maxIterations: number;
};
//# sourceMappingURL=state.d.ts.map