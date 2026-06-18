export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface LLMProvider {
    generate(messages: LLMMessage[]): Promise<{
        text: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map