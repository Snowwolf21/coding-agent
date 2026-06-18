export function tryParseOutput(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=parseOutput.js.map