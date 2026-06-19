export function parseToolCall(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=parseToolCall.js.map