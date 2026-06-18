export type EditAction = {
    action: "edit_file";
    path: string;
    patch: string;
};
export declare const conversationHistory: {
    role: "user" | "system" | "assistant" | "tool";
    content: string;
    name?: string | undefined;
    tool_call_id?: string | undefined;
}[];
//# sourceMappingURL=types.d.ts.map