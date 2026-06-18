export type FileAnalysis = {
    path: string;
    imports: string[];
    exports: number;
    size: number;
};
export declare function analyzeWorkingTree(): {
    lastUpdated: number;
    summary: string;
    graph: {};
};
//# sourceMappingURL=analyzeWorkingTree.d.ts.map