export declare function orchestrate(task: string): Promise<{
    success: boolean;
    attempt: number;
    filePath: any;
    prSummary: string;
    result: any;
    error?: never;
} | {
    success: boolean;
    error: string;
    attempt?: never;
    filePath?: never;
    prSummary?: never;
    result?: never;
}>;
//# sourceMappingURL=orchestrator.d.ts.map