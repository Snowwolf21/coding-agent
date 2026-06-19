export function parseLLMJson(text) {
    if (!text)
        return null;
    let cleaned = text.trim();
    // Remove ALL markdown safely (no regex dependency)
    cleaned = cleaned
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/`/g, "")
        .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
        throw new Error("No JSON object found in LLM output");
    }
    const candidate = cleaned.slice(start, end + 1);
    try {
        return JSON.parse(candidate);
    }
    catch (err) {
        throw new Error("JSON parse failed:\n" + candidate);
    }
}
//# sourceMappingURL=jsonParser.js.map