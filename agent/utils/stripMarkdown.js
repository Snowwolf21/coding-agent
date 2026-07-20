export function stripMarkdown(text) {
    return text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
}
//# sourceMappingURL=stripMarkdown.js.map