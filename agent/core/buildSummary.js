export function buildSummary(analyses) {
    return analyses
        .map((file) => `${file.path}: imports=${file.imports.length}`)
        .join("\n");
}
//# sourceMappingURL=buildSummary.js.map