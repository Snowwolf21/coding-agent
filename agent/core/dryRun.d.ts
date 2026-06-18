export declare function dryRunEdit(original: string, updated: string): {
    preview: boolean;
    original: string;
    updated: string;
    stats: {
        originalLength: number;
        updatedLength: number;
        changed: boolean;
    };
    timestamp: number;
};
//# sourceMappingURL=dryRun.d.ts.map