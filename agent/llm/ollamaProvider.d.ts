export declare class OllamaProvider {
    model: string;
    private normalizeMessages;
    private withSystemPrompt;
    generate(messages: any): Promise<{
        text: string;
        raw?: any;
    }>;
    stream(messages: any): AsyncGenerator<string>;
}
//# sourceMappingURL=ollamaProvider.d.ts.map