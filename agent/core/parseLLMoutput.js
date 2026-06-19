export function parseLLMOutput(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=parseLLMoutput.js.map