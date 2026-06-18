import "./core/toolManager/registerTools.js";
export default function agent(input: string): Promise<{
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
//# sourceMappingURL=agent.d.ts.map