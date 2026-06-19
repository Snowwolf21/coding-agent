export function extractJSON(text) {
    if (!text)
        return null;
    // 1. Remove ALL markdown safely (not just json blocks)
    let cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/`/g, "")
        .trim();
    // 2. Extract first JSON object only
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first === -1 || last === -1)
        return null;
    const jsonString = cleaned.slice(first, last + 1);
    try {
        return JSON.parse(jsonString);
    }
    catch (err) {
        console.log("❌ Failed to parse JSON:\n", jsonString);
        return null;
    }
}
//# sourceMappingURL=extractJSON.js.map