export interface ToolCall {
    type: "tool_call";
    tool: string;
    arguments: Record<string, any>;
}
export declare function parseToolCall(text: string): any;
//# sourceMappingURL=parseToolCall.d.ts.map