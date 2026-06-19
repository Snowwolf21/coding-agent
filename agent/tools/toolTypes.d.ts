export type ToolCall = {
    type: "tool_call";
    tool: string;
    arguments: Record<string, any>;
};
export type ToolResult = {
    tool: string;
    result: any;
};
//# sourceMappingURL=toolTypes.d.ts.map