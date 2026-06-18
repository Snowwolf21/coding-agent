export function analyzeFile(path, content) {
    const imports = content.match(/import .* from ['"](.*)['"]/g) || [];
    const exports = content.match(/export /g) || [];
    return {
        path,
        imports,
        exportsCount: exports.length,
    };
}
//# sourceMappingURL=analyzeFile.js.map