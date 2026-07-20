interface OrchestrateResult {
    success: boolean;
    attempt?: number;
    filePath?: string;
    prSummary?: string;
    result?: string;
    error?: string;
}
/**
 * Coordinates planning, coding, applying edits, running tests, checking quality metrics,
 * saving memory context, summarizing work, and committing modifications to the repository.
 */
export declare function orchestrate(task: string, history?: any[]): Promise<OrchestrateResult>;
export {};
//# sourceMappingURL=orchestrator.d.ts.map