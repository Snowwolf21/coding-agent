function buildSummary(files) {
    return files
        .map((f) => `${f.path} → imports:${f.imports.length}, exports:${f.exports}`)
        .join("\n");
}
export {};
//# sourceMappingURL=buildProjectSummary.js.map