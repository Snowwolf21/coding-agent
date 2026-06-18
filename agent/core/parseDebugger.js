export function parseDebugger(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return {
            fixes: [],
        };
    }
}
//# sourceMappingURL=parseDebugger.js.map