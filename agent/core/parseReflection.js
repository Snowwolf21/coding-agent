export function parseReflection(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return {
            improvements: [],
            risks: [],
        };
    }
}
//# sourceMappingURL=parseReflection.js.map