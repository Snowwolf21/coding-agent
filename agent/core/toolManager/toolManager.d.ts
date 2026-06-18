export declare class ToolManager {
    execute(toolName: string, args: any): Promise<{
        success: boolean;
        output: any;
        durationMs: number;
        error?: never;
    } | {
        success: boolean;
        output: null;
        error: any;
        durationMs: number;
    }>;
}
//# sourceMappingURL=toolManager.d.ts.map